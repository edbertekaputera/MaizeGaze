import { Button, Card } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DropImageInput from "../Components/DropImageInput";
import { GrPowerReset } from "react-icons/gr";
import { GiCorn } from "react-icons/gi";
import { MdCancel, MdOutlineSaveAlt } from "react-icons/md";
import { ImPencil2 } from "react-icons/im";

import axios from "axios";
import LoadingCard from "../Components/LoadingCard";

function DetectionPage() {
	const [file, setFile] = useState();
	const [status, setStatus] = useState("");
	const [result, setResult] = useState({});
	const [quota, setQuota] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get("/api/detect/get_detection_quota")
			.then((res) => {
				setQuota(res.data.quota);
			})
			.catch((error) => {
				console.log(error);
				alert("ERROR");
			});
	}, [status]);

	const handleSubmit = (event) => {
		event.preventDefault();
		if (file != null) {
			var formData = new FormData();
			formData.append("image", file);
			axios
				.post("/api/detect/init_detection", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((res) => {
					if (res.data.success) {
						setStatus("RUNNING");
						fetchDetectionResult(res.data.result_id);
					} else {
						alert("ERROR");
					}
				})
				.catch((error) => {
					console.log(error);
					alert("ERROR");
				});
		} else {
			alert("Please provide an image...");
		}
	};

	const handleReset = () => {
		setFile(null);
		setResult({});
		setStatus("");
	};

	const fetchDetectionResult = async (resultID) => {
		try {
			const res = await axios.get(
				`/api/detect/get_detection_result?result_id=${resultID}`
			);
			if (res.data.status === "ERROR") {
				setStatus(res.data.status);
				alert("ERROR");
			} else if (res.data.status === "SUCCESS") {
				setStatus(res.data.status);
				setResult(res.data.data);
			} else {
				console.log(res.data.status);
				setTimeout(fetchDetectionResult, 500, resultID);
			}
		} catch (error) {
			console.log(error);
			alert("ERROR");
		}
	};

	return (
		<>
			<LoadingCard show={status === "RUNNING"}>
				Detecting Maize Tassels...
			</LoadingCard>
			<Card className="my-10 mx-16 shadow-lg border">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Detect Maize Tassel</h1>
					<span className="px-4 py-2 bg-custom-brown-3 rounded-lg shadow-md font-semibold">
						Monthly Quota: {quota}/25
					</span>
				</header>
				<div className="flex flex-wrap flex-col justify-start px-8 mt-4 gap-3">
					<h2 className="text-2xl font-semibold">
						{status === "SUCCESS" ? "Result" : "Upload Image"}
					</h2>
					<section className="flex justify-center">
						{status !== "SUCCESS" && (
							<DropImageInput
								file={file}
								setFile={setFile}
								disabled={status === "RUNNING"}
							/>
						)}
						{status === "SUCCESS" && (
							<img
								className="rounded shadow border"
								src={"data:image/png;base64," + result.annotated_image}
							/>
						)}
					</section>
					{status !== "SUCCESS" && (
						<section className="flex flex-col lg:flex-row justify-end gap-8 mt-3">
							<Button
								disabled={status === "RUNNING"}
								className="bg-custom-brown-1 hover:bg-custom-brown-2 pl-6 pr-8 py-2 shadow w-full lg:w-56"
								onClick={handleReset}
							>
								<div className="flex flex-row justify-center items-center ">
									<GrPowerReset size={16} />
									<span className="ml-2 font-bold text-center">
										Reset
									</span>
								</div>
							</Button>
							<Button
								disabled={status === "RUNNING" || quota == 0}
								className="bg-custom-green-1 hover:bg-custom-green-2 pl-6 pr-8 py-2 shadow w-full lg:w-56"
								onClick={handleSubmit}
							>
								<div className="flex flex-row justify-center items-center ">
									<GiCorn size={16} />
									<span className="ml-2 font-bold text-center">
										Detect
									</span>
								</div>
							</Button>
						</section>
					)}
					{status == "SUCCESS" && (
						<section className="flex flex-row font-medium text-xl">
							<span>TOTAL TASSEL COUNT =</span>
							<div className="ml-1 text-custom-green-1 flex flex-row justify-start items-center gap-1">
								<span>{result.tassel_count}</span>
								<GiCorn />
							</div>
						</section>
					)}
					{status == "SUCCESS" && (
						<section className="flex flex-col lg:flex-row justify-between gap-4 mt-2">
							<Button
								disabled
								className="bg-custom-brown-1 hover:bg-custom-brown-2 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
								onClick={handleReset}
							>
								<div className="flex flex-row justify-center items-center ">
									<ImPencil2 size={16} />
									<span className="ml-2 font-bold text-center">
										Reannotate
									</span>
								</div>
							</Button>
							<div className="flex flex-col lg:flex-row justify-end gap-4 lg:gap-8">
								<Button
									className="bg-red-500 hover:bg-red-800 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
									onClick={handleReset}
								>
									<div className="flex flex-row justify-center items-center ">
										<MdCancel size={16} />
										<span className="ml-2 font-bold text-center">
											Cancel
										</span>
									</div>
								</Button>
								<Button
									disabled
									className="bg-custom-green-1 hover:bg-custom-green-2 pl-6 pr-8 py-2 shadow lg:w-56"
								>
									<div className="flex flex-row justify-center items-center ">
										<MdOutlineSaveAlt size={16} />
										<span className="ml-2 font-bold text-center">
											Save
										</span>
									</div>
								</Button>
							</div>
						</section>
					)}
				</div>
			</Card>
		</>
	);
}

export default DetectionPage;
