import { Modal, Button, TextInput, Avatar, Tooltip, Progress } from "flowbite-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingCard from "../LoadingCard";
import { format } from "date-fns";
import { HiMiniQuestionMarkCircle } from "react-icons/hi2";
import SuspendUserModal from "./SuspendUserModal";

function ViewUserModal({ state, setState, email, suspension_details }) {
	// Make sure id and email are passed as props
	const [data, setData] = useState({
		name: "",
		tier_plan: "",
		detection_quota_limit: 0,
		storage_limit: 0,
		total_detections: 0,
		total_size: 0,
		status: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [showSuspendModal, setShowSuspendModal] = useState(false);

	useEffect(() => {
		if (state && data.name === "") {
			setIsLoading(true);
			axios
				.get(`/api/admin/user_management/query_user`, {
					params: {
						email: email,
					},
				})
				.then((res) => {
					if (res.data.status_code === 200) {
						setData((prev) => ({
							...prev,
							name: res.data.result.name,
							tier_plan: res.data.result.user_type,
							email_is_verified: res.data.result.email_is_verified,
							detection_quota_limit: res.data.result.detection_quota_limit,
							storage_limit: res.data.result.storage_limit,
							total_detections: res.data.result.total_detections,
							total_size: res.data.result.total_size,
							status: suspension_details ? "Suspended" : !res.data.result.email_is_verified ? "Unverified" : "Active",
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
		}
	}, [state]);

	const getInitials = () => {
		if (data.name == "") {
			return "";
		}
		const splitted = data.name.split(" ");
		return splitted.map((val) => val[0].toUpperCase()).join("");
	};

	const formatBytes = (bytes, decimals = 2) => {
		if (!+bytes) return "0 Bytes";
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

	return (
		<>
			{/* Loading Cards */}
			<LoadingCard show={isLoading}>Loading User...</LoadingCard>
			{/* Modals */}
			<SuspendUserModal state={showSuspendModal} setState={setShowSuspendModal} selected={[email]} />
			{/* Main Modal */}
			<Modal show={state} size="4xl" onClose={() => setState(false)} popup>
				<div className="rounded shadow-md">
					<Modal.Header />
					<Modal.Body>
						<div className="flex flex-col sm:flex-row">
							<div className="flex flex-col w-full sm:w-1/2 justify-center items-center">
								<Avatar rounded placeholderInitials={getInitials()} size="xl" className="text-6xl" />
								{data.status === "Active" ? (
									<h1 className="text-2xl text-center font-bold mt-3 text-green-500">Status: {data.status}</h1>
								) : (
									<div className="text-center">
										<h1 className="text-2xl font-bold mt-3 text-red-500">Status: {data.status}</h1>
										{data.status === "Suspended" && suspension_details.end_date && (
											<div className="flex flex-row justify-center items-center gap-2">
												<span className="block">Until: {format(suspension_details.end_date, "dd MMMM yyyy, hh:mm a")}</span>
												<Tooltip content={`Reason: ${suspension_details.reason}`}>
													<HiMiniQuestionMarkCircle className="text-2xl text-gray-500 hover:text-gray-700" />
												</Tooltip>
											</div>
										)}
									</div>
								)}
								{data.status === "Active" && (
									<Button className="mt-3" color="failure" onClick={() => setShowSuspendModal(true)}>
										Suspend
									</Button>
								)}
							</div>
							<div className="mt-4 px-4 flex flex-col w-full justify-center gap-4">
								<div className="flex flex-col">
									<label className="font-semibold mb-2">Name</label>
									<TextInput type="text" value={data.name} readOnly />
								</div>
								<div className="flex flex-col">
									<label className="font-semibold mb-2">Email</label>
									<TextInput type="text" value={email} readOnly />
								</div>
								<div className="flex flex-col">
									<label className="font-semibold mb-2">Tier Plan</label>
									<TextInput type="text" value={data.tier_plan} readOnly />
								</div>
								<div className="flex flex-row justify-between gap-4">
									<div className="flex flex-col w-1/2">
										<label className="font-semibold mb-2">Verified Email</label>
										<TextInput type="text" value={String(data.email_is_verified).toUpperCase()} readOnly />
									</div>
									<div className="flex flex-col w-1/2">
										<label className="font-semibold mb-2">Total Detections</label>
										<TextInput type="text" value={data.total_detections} readOnly />
									</div>
								</div>

								<div className="flex flex-col gap-1 px-4 py-2 shadow-md rounded-lg bg-custom-white w-full">
									<span className="font-semibold flex flex-col">
										<h2 className="font-bold text-lg">Storage used</h2>
										<span className="ml-1 font-bold text-green-900">
											{formatBytes(data.total_size)} / {formatBytes(data.storage_limit * Math.pow(1024, 2))}
											{` (${(Math.round((10000 * data.total_size) / (data.storage_limit * Math.pow(1024, 2))) / 100).toFixed(2)}%)`}
										</span>
									</span>
									<Progress
										className="bg-custom-brown-3 text-white w-full"
										color="green"
										progress={Math.round((10000 * data.total_size) / (data.storage_limit * Math.pow(1024, 2))) / 100}
										size="xl"
									/>
								</div>
							</div>
						</div>
					</Modal.Body>
				</div>
			</Modal>
		</>
	);
}

export default ViewUserModal;
