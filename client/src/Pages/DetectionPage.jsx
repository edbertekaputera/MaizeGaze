import { Button, Card, Tooltip } from "flowbite-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DropImageInput from "../Components/DropImageInput";
import { GrPowerReset } from "react-icons/gr";
import { GiCorn } from "react-icons/gi";
import { MdCancel, MdOutlineSaveAlt, MdAddBox } from "react-icons/md";
import { ImPencil2 } from "react-icons/im";
import { v4 as uuidv4 } from 'uuid';

import axios from "axios";
import LoadingCard from "../Components/LoadingCard";
import SaveResultModal from "../Components/Storage/SaveResultModal";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import BBoxAnnotator from "../Components/Storage/BBoxAnnotator";

function DetectionPage() {
	const { userInfo } = useContext(AuthContext);
	const [file, setFile] = useState();
	const [status, setStatus] = useState("");
	const [result, setResult] = useState({});
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [showReannotate, setShowReannotate] = useState(false);
	const [annotations, setAnnotations] = useState([]);
	const [quota, setQuota] = useState(0);
	const [showToolTip, setShowToolTip] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (result.annotations) {
			setAnnotations(result.annotations);
		}
	
		axios
			.get("/api/detect/get_detection_quota")
			.then((res) => {
				setQuota(res.data.quota);
			})
			.catch((error) => {
				console.log(error);
				alert("ERROR");
			});
	}, [result, status]);

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

	const handleReannotateSave = (newAnnotations) => {
		const updatedResult = {
		  ...result,
		  annotations: newAnnotations,
		  tassel_count: newAnnotations.length,
		  farm_user: userInfo.email,
		  farm_name: "Corn Farm", //should be modified later 
		  id: result.id || uuidv4(), // 임의로 uid 설정(update함수가 id를 매개로 받기 때문에)
		//   tassel_count: result.tassel_count,
		};
	
		axios
		  .post("/api/storage/reannotate_result", {
			updated_result: updatedResult,
		  })
		  .then((response) => {
			if (response.data.status_code == 200) {
			  setResult(updatedResult);
			  setAnnotations(newAnnotations);
			  alert("Reannotation Successful");
			  setShowReannotate(false);
			} else {
			  console.log(response.data.message);
			  alert("Failed to update tassel count.");
			}
		  })
		  .catch((error) => {
			console.error("There was an error reannotating the result!", error);
			alert("ERROR");
		  });
	  };

	const fetchDetectionResult = async (resultID) => {
		try {
			const res = await axios.get(
				`/api/detect/get_detection_result?result_id=${resultID}`
			);
			console.log(res.data);  // 여기서 응답 데이터를 콘솔에 출력합니다.
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
		<div className="relative overflow-hidden min-h-screen">
			<LoadingCard show={status === "RUNNING"}>
				Detecting Maize Tassels...
			</LoadingCard>
			<SaveResultModal
				state={showSaveModal}
				setState={setShowSaveModal}
				file={file}
				results={result}
				post_save_action={handleReset}
			/>

			<div className="blob text-yellow-300">
				<GiCorn size={250} />
			</div>

			<div className="blob2 text-custom-green-2">
				<GiCorn size={250} />
			</div>

			<div className="blob3 text-custom-green-1">
				<GiCorn size={250} />
			</div>

			<div className="blob4 text-custom-brown-1">
				<GiCorn size={250} />
			</div>

			<div className="blob5 text-blue-500">
				<GiCorn size={250} />
			</div>

			<Card className="relative my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Detect Maize Tassel</h1>
					<span className="px-4 py-2 bg-custom-brown-3 rounded-lg shadow-md font-semibold">
						Monthly Quota: {quota}/{userInfo.detection_quota_limit}
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
								className="rounded shadow border max-h-192"
								src={"data:image/png;base64," + result.annotated_image}
							/>
						)}
                        {status === "SUCCESS" && showReannotate && (
                            <BBoxAnnotator
                                url={"data:image/png;base64," + result.annotated_image}
                                inputMethod="fixed"
                                onChange={(newAnnotations) => setAnnotations(newAnnotations)}
                                borderWidth={2}
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
							<div
								className="relative"
								onMouseEnter={() => setShowToolTip(true)}
								onMouseLeave={() => setShowToolTip(false)}
							>
								<div
									hidden={quota > 0 || !showToolTip}
									className="absolute -top-11 lg:-left-12 text-sm lg:w-80 text-center bg-red-500 text-white px-3 py-2 rounded-lg shadow"
								>
									You ran out of Detection Quota this month.
								</div>
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
							</div>
						</section>
					)}
					{status == "SUCCESS" && (
						<section className="flex flex-col md:flex-row font-medium text-xl">
							<span>TOTAL TASSEL COUNT =</span>
							<div className="ml-1 text-custom-green-1 flex flex-row justify-start items-center gap-1">
								<span>{result.tassel_count}</span>
								<GiCorn />
							</div>
						</section>
					)}
					{status == "SUCCESS" && (
						<section className="flex flex-col lg:flex-row justify-between gap-4 mt-2">
                            {!showReannotate ? (
                                <Button
                                    className="bg-custom-brown-1 hover:bg-custom-brown-2 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
                                    onClick={() => setShowReannotate(true)}
                                >
                                    <div className="flex flex-row justify-center items-center ">
                                        <ImPencil2 size={16} />
                                        <span className="ml-2 font-bold text-center">
                                            Reannotate
                                        </span>
                                    </div>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        className="bg-custom-green-1 hover:bg-custom-green-2 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
                                        onClick={() => handleReannotateSave(annotations)}
                                    >
                                        <div className="flex flex-row justify-center items-center ">
                                            <MdOutlineSaveAlt size={16} />
                                            <span className="ml-2 font-bold text-center">
                                                Save Changes
                                            </span>
                                        </div>
                                    </Button>
                                    <Button
                                        className="bg-custom-blue-1 hover:bg-custom-blue-2 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
                                        onClick={() => setShowReannotate(false)}
                                    >
                                        <div className="flex flex-row justify-center items-center ">
                                            <MdCancel size={16} />
                                            <span className="ml-2 font-bold text-center">
                                                Cancel
                                            </span>
                                        </div>
                                    </Button>
                                </>
                            )}
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
									disabled={!file || !result}
									className="bg-custom-green-1 hover:bg-custom-green-2 pl-6 pr-8 py-2 shadow lg:w-56"
									onClick={() => setShowSaveModal(true)}
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
		</div>
	);
}

export default DetectionPage;
