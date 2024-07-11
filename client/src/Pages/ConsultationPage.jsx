import { Avatar, Card, TextInput } from "flowbite-react";
import React, { useContext, useEffect, useState } from "react";
import { TbMessageChatbot, TbPlant } from "react-icons/tb";

import { IoMdArrowRoundUp } from "react-icons/io";
import axios from "axios";
import ChatBubble from "../Components/Chat/ChatBubble";
import { MdOutlineTipsAndUpdates, MdPestControl } from "react-icons/md";
import { GiCorn } from "react-icons/gi";
import Markdown from "react-markdown";
import { AuthContext } from "../Components/Authentication/PrivateRoute";

function ConsultationPage() {
	const [Question, setQuestion] = useState("");
	const [chat, setChat] = useState([]);
	const [quota, setQuota] = useState({
		quota: 0,
		limit: 0,
	});
	const { userInfo } = useContext(AuthContext);

	useEffect(() => {
		axios
			.get("/api/chatbot/consultation/get_consultation_quota")
			.then((res) => {
				setQuota(res.data);
			})
			.catch((error) => {
				console.log(error);
				alert("ERROR");
			});
	}, [chat]);

	const handleSubmit = () => {
		if (Question.trim() === "" || quota.quota == 0) {
			alert("Please provide an image and a Question...");
		} else {
			axios
				.post("/api/chatbot/consultation/init_consultation", { question: Question })
				.then((res) => {
					if (res.data.success) {
						setChat((prev) => [
							...prev,
							{
								name: userInfo.name,
								icon: (
									<Avatar
										rounded
										placeholderInitials={userInfo.name
											.split(" ")
											.map((val) => val[0].toUpperCase())
											.join("")}
										bordered
										color={"success"}
										className="text-2xl"
									/>
								),
								time: new Date(),
								children: <p>{Question}</p>,
							},
							{
								name: "Maize Consultant",
								icon: (
									<div>
										<TbMessageChatbot className=" text-custom-green-2  text-4xl" />
									</div>
								),
							},
						]);
						setQuestion("");
						fetchConsultationResult(res.data.result_id);
					} else {
						alert("ERROR");
					}
				})
				.catch((error) => {
					console.log(error);
					alert("ERROR");
				});
		}
	};

	const handleFAQSubmit = (question) => {
		if (quota.quota == 0) {
			alert("You don't have anymore quota left...");
		} else {
			axios
				.post("/api/chatbot/consultation/init_consultation", { question: question })
				.then((res) => {
					if (res.data.success) {
						setChat((prev) => [
							...prev,
							{
								name: userInfo.name,
								icon: (
									<Avatar
										rounded
										placeholderInitials={userInfo.name
											.split(" ")
											.map((val) => val[0].toUpperCase())
											.join("")}
										bordered
										color={"success"}
										className="text-2xl"
									/>
								),
								time: new Date(),
								children: <p>{question}</p>,
							},
							{
								name: "Maize Consultant",
								icon: (
									<div>
										<TbMessageChatbot className=" text-custom-green-2  text-4xl" />
									</div>
								),
							},
						]);
						setQuestion("");
						fetchConsultationResult(res.data.result_id);
					} else {
						alert("ERROR");
					}
				})
				.catch((error) => {
					console.log(error);
					alert("ERROR");
				});
		}
	};

	const fetchConsultationResult = async (resultID) => {
		try {
			const res = await axios.get(`/api/chatbot/consultation/get_consultation_result?result_id=${resultID}`);
			if (res.data.status === "ERROR") {
				console.log(res.data.message);
				setChat((prev) => {
					const newList = [...prev];
					newList[newList.length - 1] = {
						name: "Maize Consultant",
						icon: (
							<div>
								<TbMessageChatbot className=" text-custom-green-2  text-4xl" />
							</div>
						),
						time: new Date(),
						children: "An error occured! Please Try again...",
					};
					return newList;
				});
			} else if (res.data.status === "SUCCESS") {
				setChat((prev) => {
					const newList = [...prev];
					newList[newList.length - 1] = {
						name: "Maize Consultant",
						icon: (
							<div>
								<TbMessageChatbot className=" text-custom-green-2  text-4xl" />
							</div>
						),
						time: new Date(),
						children: <Markdown>{res.data.data.response}</Markdown>,
					};
					return newList;
				});
			} else {
				console.log(res.data.status);
				setTimeout(fetchConsultationResult, 500, resultID);
			}
		} catch (error) {
			console.log(error);
			setChat((prev) => {
				const newList = [...prev];
				newList[newList.length - 1] = {
					name: "Maize Consultant",
					icon: (
						<div>
							<TbMessageChatbot className=" text-custom-green-2  text-4xl" />
						</div>
					),
					time: new Date(),
					children: "An error occured! Please Try again...",
				};
				return newList;
			});
		}
	};

	const faq_list = [
		{ icon: <TbPlant className="text-custom-green-1" size={20} />, question: "What type of soil is best for maize farming?" },
		{ icon: <MdPestControl className="text-red-600" size={20} />, question: "How can I control pests on my maize farm?" },
		{ icon: <GiCorn className="text-yellow-500" size={20} />, question: "How do I know when my maize is ready to harvest?" },
		{ icon: <MdOutlineTipsAndUpdates className="text-blue-500" size={20} />, question: "What are some common mistakes to avoid in maize farming?" },
	];

	return (
		<div className="relative overflow-hidden min-h-screen">
			<Card className="relative my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				<div className="flex flex-col sm:p-4 gap-y-6">
					<div className="flex flex-col gap-y-6 bg-gray-100 p-4 sm:p-8 h-192 rounded-lg shadow-lg border overflow-y-auto ">
						{chat.length == 0 && (
							<div className="flex flex-col justify-center w-full items-center my-auto">
								<TbMessageChatbot className=" text-custom-green-2 text-9xl mb-2" />
								<h1 className="text-5xl text-center font-bold mb-2">
									Welcome to <span className="text-custom-green-1">Maize Consultation</span>
								</h1>
								<h2 className="text-xl sm:text-2xl text-gray-500 text-center sm:w-2/3 mb-2">
									Your AI-powered maize expert. Ask any question about maize cultivation, and receive detailed, research-based answers instantly.
								</h2>
								{quota.quota > 0 ? (
									<>
										<p className="p-2 px-4 font-medium border shadow-sm drop-shadow-sm bg-custom-green-2 text-white rounded-2xl mb-4">{`Monthly Quota: ${quota.quota}/${quota.limit}`}</p>
										<div className="grid grid-cols-2 w-11/12 lg:grid-cols-4 sm:w-10/12 md:w-9/12 lg:w-8/12 2xl:w-7/12 gap-4">
											{faq_list.map((faq, index) => (
												<div
													className="flex flex-col gap-2 p-2.5 bg-gray-150 hover:bg-gray-200 outline outline-1 outline-gray-500 shadow-sm drop-shadow-sm rounded-lg"
													key={index}
													onClick={() => {
														handleFAQSubmit(faq.question);
													}}
												>
													{faq.icon}
													<p className=" text-sm">{faq.question}</p>
												</div>
											))}
										</div>
									</>
								) : (
									<p className="p-2 px-4 font-medium border shadow-sm drop-shadow-sm bg-red-500 text-white rounded-2xl">{`You ran out of quota this month.`}</p>
								)}
							</div>
						)}
						<div className="flex flex-col text-gray-700 font-medium gap-y-5">
							{chat.map((c, i) => {
								return (
									<ChatBubble key={i} name={c.name} icon={c.icon} time={c.time} image={c.image}>
										{c.children}
									</ChatBubble>
								);
							})}
						</div>
					</div>
					<div className="flex flex-col bg-gray-100 rounded-3xl shadow-lg border p-4 px-6">
						<div className="flex flex-row justify-between items-center gap-x-4">
							<TextInput
								className="flex-grow"
								color={"white"}
								placeholder="Enter your question..."
								maxLength={200}
								value={Question}
								onChange={(ev) => setQuestion(ev.target.value)}
							/>
							<IoMdArrowRoundUp
								className={`p-1.5 text-4xl text-white rounded-3xl ${
									quota.quota > 0 && (chat.length == 0 || chat[chat.length - 1].children != null) && Question.trim() !== ""
										? "bg-custom-green-1 hover:bg-custom-green-2"
										: "bg-gray-300"
								}`}
								onClick={() => {
									if (quota.quota > 0 && (chat.length == 0 || chat[chat.length - 1].children != null) && Question.trim() !== "") {
										handleSubmit();
									}
								}}
							/>
						</div>
						<span className={`mt-1 text-sm ${quota.quota > 0 ? "text-end text-gray-500" : "text-start text-red-500"}`}>
							{quota.quota > 0 ? `Quota: ${quota.quota}/${quota.limit}` : `You ran out of quota for this month. ${quota.quota}/${quota.limit}`}
						</span>
					</div>
				</div>
			</Card>
		</div>
	);
}

export default ConsultationPage;
