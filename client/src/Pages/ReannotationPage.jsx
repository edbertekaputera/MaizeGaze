import React, { useContext, useEffect, useState, useRef } from "react";
import { Button, Card } from "flowbite-react";
import { GiCorn } from "react-icons/gi";
import { MdCancel, MdOutlineSaveAlt } from "react-icons/md";
import { ReactPictureAnnotation } from "react-picture-annotation";
import axios from "axios";
import LoadingCard from "../Components/LoadingCard";
import ConfirmationModal from "../Components/ConfirmationModal";
import { useSearchParams, useNavigate } from "react-router-dom";
import GuideButton from "../Components/GuideButton";
import guide1 from "../assets/guide1.gif";
import guide2 from "../assets/guide2.gif";
import guide3 from "../assets/guide3.gif";

function ReannotationPage() {
	const [searchParams] = useSearchParams();
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [originalImage, setOriginalImage] = useState(null);
	const [annotations, setAnnotations] = useState([]);
	const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
	const canvasRef = useRef(null);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const navigate = useNavigate();
	const reannotation_guide = [
		{
			image: guide1,
			subtitle: "Add new annotation",
			description: "Place cursor over the desired position on the image, drag to draw a box label around the tassel.",
		},
		{
			image: guide2,
			subtitle: "Delete annotation",
			description: "Double-click the box label and click the BIN icon.",
		},
		{
			image: guide3,
			subtitle: "Tassel Count",
			description: "Check you tassel count during re-annotating!",
		},
	];

	useEffect(() => {
		const fetchData = async () => {
			const id = searchParams.get("id");
			const farmName = searchParams.get("farm_name");
			const farmPatchId = searchParams.get("farm_patch_id");

			if (!id || !farmName || !farmPatchId) {
				setError("Missing id, farm_name, or farm_patch_id in URL");
				setLoading(false);
				return;
			}

			try {
				const response = await axios.get("/api/storage/query_result", {
					params: { id, farm_name: farmName, farm_patch_id: farmPatchId },
				});

				if (response.data.status_code === 200) {
					const resultData = response.data.result;
					setResult(resultData);
					setAnnotations(resultData.annotations);

					// Load the image and get its dimensions
					const img = new Image();
					img.onload = () => {
						setImageDimensions({ width: img.width, height: img.height });
						setOriginalImage(`data:image/png;base64,${resultData.original_image}`);
					};
					img.src = `data:image/png;base64,${resultData.original_image}`;
				} else {
					setError(response.data.message || "Failed to fetch data");
				}
			} catch (err) {
				setError("An error occurred while fetching data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [searchParams]);

	const handleSaveClick = () => {
		setShowSaveModal(true);
	};

	const handleSaveConfirm = async () => {
		console.log("Saving new normalized annotations:", annotations);
		drawUpdatedAnnotations();

		const updatedResult = {
			...result,
			annotations: annotations,
			tassel_count: annotations.length,
		};

		try {
			const response = await axios.post("/api/storage/reannotate_result", {
				updated_result: updatedResult,
			});

			if (response.data.status_code === 200) {
				alert("Annotations saved successfully!");
				setResult(updatedResult);
				setTimeout(() => {
					navigate("/user/result_history");
				}, 1000);
			} else {
				alert("Failed to save annotations: " + response.data.message);
			}
		} catch (error) {
			console.error("Error saving annotations:", error);
			alert("An error occurred while saving annotations");
		}
	};

	const onAnnotationChange = (newAnnotations) => {
		const convertedAnnotations = newAnnotations.map((ann) => {
			const centerX = ann.mark.x + ann.mark.width / 2;
			const centerY = ann.mark.y + ann.mark.height / 2;

			const normalizedX = centerX / imageDimensions.width;
			const normalizedY = centerY / imageDimensions.height;
			const normalizedWidth = ann.mark.width / imageDimensions.width;
			const normalizedHeight = ann.mark.height / imageDimensions.height;

			return {
				x: normalizedX,
				y: normalizedY,
				width: normalizedWidth,
				height: normalizedHeight,
			};
		});

		setAnnotations(convertedAnnotations);
		setResult((prevResult) => ({
			...prevResult,
			tassel_count: convertedAnnotations.length,
		}));
	};

	const handleSaveAnnotations = () => {
		console.log("Saving new normalized annotations:", annotations);
		drawUpdatedAnnotations();
		setResult((prevResult) => ({
			...prevResult,
			annotations: annotations,
			tassel_count: annotations.length,
		}));
	};

	const drawUpdatedAnnotations = () => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const image = new Image();
		image.src = originalImage;

		image.onload = () => {
			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0, image.width, image.height);

			annotations.forEach((ann) => {
				const centerX = ann.x * image.width;
				const centerY = ann.y * image.height;
				const width = ann.width * image.width;
				const height = ann.height * image.height;
				const x = centerX - width / 2;
				const y = centerY - height / 2;

				ctx.strokeStyle = "rgb(256, 0, 256)";
				ctx.lineWidth = canvas.width > 1000 ? 5 : 3;
				ctx.strokeRect(x, y, width, height);
			});

			const updatedImage = canvas.toDataURL("image/png");
			setResult((prevResult) => ({
				...prevResult,
				annotated_image: updatedImage.split(",")[1], // Remove the data URL prefix
			}));
		};
	};

	const renderAnnotation = ({ annotation, onClick, onChange }) => {
		const centerX = annotation.x * imageDimensions.width;
		const centerY = annotation.y * imageDimensions.height;
		const width = annotation.width * imageDimensions.width;
		const height = annotation.height * imageDimensions.height;
		const x = centerX - width / 2;
		const y = centerY - height / 2;

		return (
			<div
				key={annotation.id}
				style={{
					border: "1px solid red",
					position: "absolute",
					left: `${x}px`,
					top: `${y}px`,
					width: `${width}px`,
					height: `${height}px`,
					cursor: "pointer",
				}}
				onClick={onClick}
			/>
		);
	};

	const handleSelect = (selectedId) => {
		console.log("Selected annotation:", selectedId);
	};

	if (loading) return <LoadingCard show={true}>Loading Image...</LoadingCard>;
	if (error) return <div>Error: {error}</div>;
	if (!result || !originalImage) return <div>No result data available</div>;

	return (
		<div className="relative overflow-hidden min-h-screen">
			<Card className="relative my-6 mx-4 lg:my-10 lg:mx-16 shadow-lg border xl:mb-20">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Re-annotation</h1>
					<GuideButton
						tooltipContent="example"
						buttonColor="bg-yellow-500"
						buttonHoverColor="bg-yellow-600"
						iconColor="text-gray-800"
						guides={reannotation_guide}
					/>
				</header>

				<div className="flex flex-wrap flex-col justify-start px-8 mt-4 gap-3">
					<section className="flex justify-center">
						<div className="w-full max-w-2xl mx-auto" style={{ height: "643px" }}>
							<ReactPictureAnnotation
								image={originalImage}
								onAnnotationChange={onAnnotationChange}
								annotationData={annotations.map((ann, index) => ({
									id: (index + 1).toString(),
									mark: {
										x: ann.x * imageDimensions.width - (ann.width * imageDimensions.width) / 2,
										y: ann.y * imageDimensions.height - (ann.height * imageDimensions.height) / 2,
										width: ann.width * imageDimensions.width,
										height: ann.height * imageDimensions.height,
									},
								}))}
								onChange={onAnnotationChange}
								onSelect={handleSelect}
								renderAnnotation={renderAnnotation}
								width={Math.min(imageDimensions.width, 1000)} // max width
								height={Math.min(imageDimensions.height, 750)} // max height
								scrollSpeed={0}
								zoomScale={1}
								disabled={false}
								allowZoom={false}
							/>
							<canvas ref={canvasRef} style={{ display: "none" }} />
						</div>
					</section>
				</div>

				<section className="flex flex-col md:flex-row font-medium text-xl">
					<span>TOTAL TASSEL COUNT =</span>
					<div className="ml-1 text-custom-green-1 flex flex-row justify-start items-center gap-1">
						<span>{result.tassel_count}</span>
						<GiCorn />
					</div>
				</section>

				{/* Save Button */}
				<section className="flex flex-col lg:flex-row justify-between gap-4 mt-2">
					<Button className="bg-custom-brown-1 hover:bg-custom-brown-2 pl-6 pr-8 py-2 shadow w-100 lg:w-56" onClick={handleSaveClick}>
						<div className="flex flex-row justify-center items-center">
							<MdOutlineSaveAlt size={16} />
							<span className="ml-2 font-bold text-center">Save</span>
						</div>
					</Button>
				</section>
			</Card>

			<ConfirmationModal state={showSaveModal} setState={setShowSaveModal} action={handleSaveConfirm} icon={<MdOutlineSaveAlt size={64} />}>
				Are you sure you want to save these annotations?
			</ConfirmationModal>
		</div>
	);
}

export default ReannotationPage;
