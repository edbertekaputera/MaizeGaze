import axios from "axios";
import { Button, Modal, Spinner, Toast } from "flowbite-react";
import React, { useEffect, useState, Component } from "react";
import { PiFarmFill } from "react-icons/pi";
import { GiCorn } from "react-icons/gi";
import { FiTrash2 } from "react-icons/fi";
import { IoMdDownload } from "react-icons/io";
import { format } from "date-fns";
import LoadingCard from "../LoadingCard";
import ConfirmationModal from "../ConfirmationModal";
import MessageModal from "../MessageModal";
import { MdDelete, MdFileDownload } from "react-icons/md";

function ViewResultModal({ state, setState, id, farm_name }) {
	const [isLoading, setIsLoading] = useState(true);
	const [showDownloadToast, setShowDownloadToast] = useState(false);
	const [showMessageModal, setShowMessageModal] = useState(false);
	const [showDownloadModal, setShowDownloadModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDownloadLoading, setIsDownloadLoading] = useState(false);
	const [isDeleteLoading, setIsDeleteLoading] = useState(false);

	const [data, setData] = useState({
		tassel_count: 0,
		record_date: new Date(),
		name: "",
		description: "",
		original_image: "",
		annotated_image: "",
		annotations: [],
	});

	useEffect(() => {
		axios
			.get(`/api/storage/query_result`, {
				params: {
					id: id,
					farm_name: farm_name,
				},
			})
			.then((res) => {
				if (res.data.status_code == 200) {
					const splitted = res.data.result.record_date.split(" ");
					const splitted_date = splitted[0].split("-");
					const splitted_time = splitted[1].split(":");
					const date_obj = new Date(
						splitted_date[0],
						parseInt(splitted_date[1]) - 1,
						splitted_date[2],
						splitted_time[0],
						splitted_time[1],
						splitted_time[2]
					);
					setData((prev) => ({
						...prev,
						tassel_count: res.data.result.tassel_count,
						record_date: date_obj,
						name: res.data.result.name,
						description: res.data.result.description,
						original_image: res.data.result.original_image,
						annotated_image: res.data.result.annotated_image,
						annotations: res.data.result.annotations,
					}));
				} else {
					console.log(res.data.status_code, res.data.message);
					alert(res.data.message);
					setState(false);
				}
			})
			.catch((error) => {
				console.log(error);
				alert("Error while fetching...");
			})
			.then(() => setIsLoading(false));
	}, []);

	const handleDownload = () => {
		let data = {
			results_pk: [
				{
					id: id,
					farm_name: farm_name,
				},
			],
		};

		setIsDownloadLoading(true);
		axios
			.post("/api/storage/download_results", data, {
				responseType: "blob",
			})
			.then((res) => {
				if (res.status === 200) {
					const blob = new Blob([res.data], { type: "application/zip" });
					const fileName =
						res.headers["content-disposition"]?.split("=")[1] ||
						"files.zip";
					// Create a temporary URL for the Blob
					const url = window.URL.createObjectURL(blob);

					// Create a link element
					const link = document.createElement("a");
					link.href = url;
					link.download = fileName;

					// Append the link to the document body
					document.body.appendChild(link);
					// Trigger the download
					link.click();
					// Clean up the temporary URL
					window.URL.revokeObjectURL(url);

					// Post-operations
					setShowDownloadToast(true);
				} else {
					console.log(res.status);
					alert("Something went wrong!");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
			})
			.then(() => setIsDownloadLoading(false));
	};

	const handleDelete = () => {
		let data = {
			results_pk: [
				{
					id: id,
					farm_name: farm_name,
				},
			],
		};
		setIsDeleteLoading(true);
		axios
			.delete("/api/storage/delete_results", { data: data })
			.then((res) => {
				if (res.data.success) {
					setShowMessageModal(true);
				} else {
					console.log(res.status);
					alert("Something went wrong!");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
			})
			.then(() => setIsDeleteLoading(false));
	};

	return (
		<>
			{/* Toast */}
			{showDownloadToast && (
				<Toast className="absolute right-2 top-20 z-50 bg-custom-green-1 bg-opacity-70">
					<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-custom-green-3 bg-opacity-80 text-custom-green-1">
						<MdFileDownload className="h-5 w-5" />
					</div>
					<div className="ml-3 text-sm font-semibold text-white">
						Result Records downloaded successfully.
					</div>
					<Toast.Toggle
						className="text-white bg-transparent"
						onDismiss={() => setShowDownloadToast(false)}
					/>
				</Toast>
			)}

			{/* Loading Cards */}
			<LoadingCard show={isDownloadLoading}>
				Initiating Download...
			</LoadingCard>
			<LoadingCard show={isDeleteLoading}>
				Initiating Deletion...
			</LoadingCard>

			{/* Download Confirmation Modal */}
			<ConfirmationModal
				state={showDownloadModal}
				setState={setShowDownloadModal}
				action={handleDownload}
				icon={<MdFileDownload size={64} />}
			>
				Are you sure you want to download these detection results?
			</ConfirmationModal>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				state={showDeleteModal}
				setState={setShowDeleteModal}
				action={handleDelete}
				icon={<MdDelete size={64} />}
			>
				Are you sure you want to delete these detection results?
			</ConfirmationModal>

			{/* Delete Success Message */}
			<MessageModal
				state={showMessageModal}
				setState={() => {
					setShowMessageModal(false);
					window.location.reload();
				}}
			>
				Selected result records has been successfully deleted.
			</MessageModal>
			<Modal show={state} size="6xl" onClose={() => setState(false)} popup>
				<div className="rounded shadow-md">
					<Modal.Header></Modal.Header>
					<Modal.Body>
						<LoadingCard show={isLoading}>
							Loading Image...
						</LoadingCard>
						<div className="p-5">
							<div className="flex justify-center">
								<img
									className="max-h-1/2 rounded-sm"
									src={"data:image/png;base64," + data.annotated_image}
									alt="Annotated Image"
								/>
							</div>
							<div className="mt-5">
								<div className="flex flex-wrap items-start">
									<div className="flex-1">
										<h1 className="text-2xl font-bold">
											{data.name}
										</h1>
										<h2 className="text-gray-700 font-medium text-sm w-5/6 text-justify mt-1">
											{data.description}
											"Lorem ipsum dolor sit amet, consectetur
											adipiscing elit, sed do eiusmod tempor
											incididunt ut labore et dolore magna aliqua. Ut
											enim ad minim veniam, quis nostrud exercitation
											ullamco laboris nisi ut aliquip ex ea commodo
											consequat. Duis aute irure dolor in
											reprehenderit in voluptate velit esse cillum
											dolore eu fugiat nulla pariatur. Excepteur sint
											occaecat cupidatat non proident, sunt in culpa
											qui officia deserunt mollit anim id est
											laborum."
										</h2>
									</div>
									<div className="flex items-start gap-5 ml-auto">
										<Button
											className="px-2"
											color="failure"
											onClick={() => setShowDeleteModal(true)}
										>
											<FiTrash2 size={25} />
										</Button>
										<Button
											className="px-2 bg-custom-green-1 hover:bg-custom-green-2"
											onClick={() => setShowDownloadModal(true)}
										>
											<IoMdDownload size={25} />
										</Button>
									</div>
								</div>
								<div className="flex flex-wrap mt-5 items-center">
									<div className="flex items-center">
										<span>
											{" "}
											<PiFarmFill />{" "}
										</span>
										<span className="ml-2">{farm_name}</span>
									</div>
									<div className="flex items-center ml-auto">
										<span>{format(data.record_date, "KK:mm a")}</span>
									</div>
								</div>
								<div className="flex flex-wrap mt-5 items-center">
									<div className="flex items-center">
										<span>
											{" "}
											<GiCorn />{" "}
										</span>
										<span className="ml-2">{data.tassel_count}</span>
									</div>
									<div className="flex items-center ml-auto">
										<span>
											<i>
												{format(
													data.record_date,
													"EEEE, do MMMM yyy"
												)}
											</i>
										</span>
									</div>
								</div>
							</div>
						</div>
					</Modal.Body>
				</div>
			</Modal>
		</>
	);
}

export default ViewResultModal;
