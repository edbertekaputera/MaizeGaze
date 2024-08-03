import { Avatar, Button, Card, TextInput } from "flowbite-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaStethoscope } from "react-icons/fa6";
import { IoMdArrowRoundUp } from "react-icons/io";
import Markdown from "react-markdown";
import FileInputButton from "../Components/FileInputButton";
import axios from "axios";
import LoadingCard from "../Components/LoadingCard";
import ChatBubble from "../Components/Chat/ChatBubble";
import { format } from "date-fns";
import { AuthContext } from "../Components/Authentication/PrivateRoute";

function MaizeDoctorPage() {
	const fileInputRef = useRef(null);
	const [description, setDescription] = useState("");
	const [file, setFile] = useState();
	const [chat, setChat] = useState([]);
	const { userInfo } = useContext(AuthContext);

	const [quota, setQuota] = useState({
		quota: 0,
		limit: 0,
	});
	useEffect(() => {
		axios
			.get("/api/chatbot/diagnosis/get_diagnosis_quota")
			.then((res) => {
				setQuota(res.data);
			})
			.catch((error) => {
				console.log(error);
				alert("ERROR");
			});
	}, [chat]);

	const handleSubmit = () => {
		if (description.trim() === "" || !file || quota.quota == 0) {
			alert("Please provide an image and a description...");
		} else {
			var formData = new FormData();
			formData.append("image", file);
			formData.append("description", description);

			axios
				.post("/api/chatbot/diagnosis/init_diagnose", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
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
								image: Object.assign(file, {
									preview: URL.createObjectURL(file),
								}),
								children: <p>{description}</p>,
							},
							{
								name: "Maize Doctor",
								icon: (
									<div>
										<FaStethoscope className=" text-custom-green-2  text-4xl" />
									</div>
								),
							},
						]);
						setDescription("");
						handleRemoveFile();
						fetchDiagnosisResult(res.data.result_id);
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

	const handleRemoveFile = () => {
		setFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const generateDiagnosisOutput = (diagnosis) => {
		return (
			<div className="flex flex-col text-gray-700 font-medium gap-y-5 overflow-y-auto">
				<section className="">
					<h1 className="text-3xl mb-2 font-bold">
						Diagnosis: <span className="text-custom-green-1">{diagnosis.diagnosis_title}</span>
					</h1>
					<p className="text-justify ">{diagnosis.description}</p>
				</section>
				<section className="">
					<h2 className="text-2xl mb-1 font-bold">Potential Causes:</h2>
					<ol>
						{diagnosis.potential_causes.map((cause, index) => {
							return (
								<li key={index} className="mb-1">
									<h3 className="text-xl font-semibold text-custom-green-1">
										{index + 1}. {cause.cause_title}
									</h3>
									<Markdown>{cause.cause_description}</Markdown>
								</li>
							);
						})}
					</ol>
				</section>
				<section className="">
					<h2 className="text-2xl mb-1 font-bold">Treatment:</h2>
					<ol>
						{diagnosis.treatment.map((treatment_option, index) => {
							return (
								<li key={index} className="mb-1">
									<h3 className="text-xl font-semibold text-custom-green-1">
										{index + 1}. {treatment_option.treatment_title}
									</h3>
									<Markdown>{treatment_option.treatment_description}</Markdown>
								</li>
							);
						})}
					</ol>
				</section>
			</div>
		);
	};

	const fetchDiagnosisResult = async (resultID) => {
		try {
			const res = await axios.get(`/api/chatbot/diagnosis/get_diagnosis_result?result_id=${resultID}`);
			if (res.data.status === "ERROR") {
				console.log(res.data.message);
				setChat((prev) => {
					const newList = [...prev];
					newList[newList.length - 1] = {
						name: "Maize Doctor",
						icon: (
							<div>
								<FaStethoscope className=" text-custom-green-2  text-4xl" />
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
						name: "Maize Doctor",
						icon: (
							<div>
								<FaStethoscope className=" text-custom-green-2  text-4xl" />
							</div>
						),
						time: new Date(),
						children: generateDiagnosisOutput(res.data.data),
					};
					return newList;
				});
			} else {
				console.log(res.data.status);
				setTimeout(fetchDiagnosisResult, 500, resultID);
			}
		} catch (error) {
			console.log(error);
			setChat((prev) => {
				const newList = [...prev];
				newList[newList.length - 1] = {
					name: "Maize Doctor",
					icon: (
						<div>
							<FaStethoscope className=" text-custom-green-2  text-4xl" />
						</div>
					),
					time: new Date(),
					children: "An error occured! Please Try again...",
				};
				return newList;
			});
		}
	};

	return (
		<div className="relative overflow-hidden min-h-screen">
			<Card className="relative my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				<div className="flex flex-col sm:p-4 gap-y-6">
					<div className="flex flex-col gap-y-6 bg-gray-100 p-4 sm:p-8 h-192 rounded-lg shadow-lg border overflow-y-auto ">
						{chat.length == 0 && (
							<div className="flex flex-col justify-center w-full items-center my-auto">
								<FaStethoscope className=" text-custom-green-2 text-9xl mb-4" />
								<h1 className="text-5xl text-center font-bold mb-2">
									Welcome to <span className="text-custom-green-1">Maize Doctor</span>
								</h1>
								<h2 className="text-xl sm:text-2xl text-gray-500 text-center sm:w-2/3 mb-2">
									AI-powered diagnosis for your maize plants' health conditions. Simply upload a photo, describe the symptoms, and get instant expert
									analysis and treatment recommendations.
								</h2>
								{quota.quota > 0 ? (
									<p className="p-2 px-4 font-medium border shadow-sm drop-shadow-sm bg-custom-green-2 text-white rounded-2xl">{`Monthly Quota: ${quota.quota}/${quota.limit}`}</p>
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
								value={description}
								onChange={(ev) => setDescription(ev.target.value)}
							/>
							<div className="flex flex-col px-2">
								<div className="flex flex-row justify-center items-center gap-x-4">
									<FileInputButton
										setSelectedFile={setFile}
										fileInputRef={fileInputRef}
										disabled={chat.length > 0 && chat[chat.length - 1].children == null}
									/>
									<IoMdArrowRoundUp
										className={`p-1.5 text-4xl text-white rounded-3xl ${
											quota.quota > 0 && (chat.length == 0 || chat[chat.length - 1].children != null) && description.trim() !== "" && file
												? "bg-custom-green-1 hover:bg-custom-green-2"
												: "bg-gray-300"
										}`}
										onClick={() => {
											if (quota.quota > 0 && (chat.length == 0 || chat[chat.length - 1].children != null) && description.trim() !== "" && file) {
												handleSubmit();
											}
										}}
									/>
								</div>
								<span className="text-sm text-center text-gray-500">{`Quota: ${quota.quota}/${quota.limit}`}</span>
							</div>
						</div>
						{file && (
							<div className="text-black flex flex-row items-center gap-4 mt-4">
								<img src={file.preview} onLoad={() => URL.revokeObjectURL(file.preview)} className="h-8 rounded-lg" />
								{file.name} <span>{Math.round((file.size / 1024 / 1024) * 100) / 100}MB</span>
								<Button size={"xs"} color={"red"} onClick={handleRemoveFile}>
									Remove
								</Button>
							</div>
						)}
						<span
							className={`${quota.quota > 0 && "hidden"} mt-1 text-sm text-red-500`}
						>{`You ran out of quota for this month. ${quota.quota}/${quota.limit}`}</span>
					</div>
				</div>
			</Card>
		</div>
	);
}

export default MaizeDoctorPage;
