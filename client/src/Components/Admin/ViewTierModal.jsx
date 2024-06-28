import { Button, Modal, Card, Label, Dropdown, TextInput, Checkbox } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaChevronDown, FaRegUser } from "react-icons/fa";
import axios from "axios";
import MessageModal from "../MessageModal";
import LoadingCard from "../LoadingCard";
import { TbCapture } from "react-icons/tb";
import { GrStorage } from "react-icons/gr";
import { IoPricetagsOutline, IoTrashOutline } from "react-icons/io5";
import { MdOutlineCancel, MdOutlineEdit, MdOutlineSaveAlt } from "react-icons/md";
import ConfirmationModal from "../ConfirmationModal";

function ViewTierModal({ state, setState, name }) {
	// Original Attributes
	const [data, setData] = useState(null);

	// Editable Attributes
	const [isUpdating, setIsUpdating] = useState(false);
	const [storageLimitUnit, setStorageLimitUnit] = useState("GB");
	const [storageLimit, setStorageLimit] = useState(1);
	const [detectionQuota, setDetectionQuota] = useState(1);
	const [price, setPrice] = useState(1.0);
	const [permissions, setPermissions] = useState({
		can_reannotate: false,
		can_chatbot: false,
		can_active_learn: false,
	});

	// Other misc states
	const [isLoading, setIsLoading] = useState(false);
	// Remove states
	const [messageModal, setMessageModal] = useState(false);
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [isRemoveLoading, setIsRemoveLoading] = useState(false);
	// Update states
	const [updateMessageModal, setupdateMessageModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [isUpdateLoading, setIsUpdateLoading] = useState(false);

	useEffect(() => {
		if (state && data == null) {
			setIsLoading(true);
			axios
				.get("/api/admin/tier_management/query_tier", {
					params: {
						name: name,
					},
				})
				.then((res) => {
					if (res.data.status_code === 200) {
						setData(res.data.data);
						resetEditable(res.data.data);
					} else {
						alert(`Failed to load information on tier '${name}', please try again...`);
						window.location.reload();
					}
				})
				.catch((error) => {
					console.log(error);
					alert(`Failed to load information on tier '${name}', please try again...`);
					window.location.reload();
				})
				.then(() => setIsLoading(false));
		}
	}, [state, name]);

	const resetEditable = (tier_data) => {
		if (Object.keys(retrieveChanges(tier_data)).length != 0) {
			setStorageLimitUnit(tier_data.storage_limit >= 1024 ? "GB" : "MB");
			setStorageLimit(tier_data.storage_limit >= 1024 ? tier_data.storage_limit / 1024 : tier_data.storage_limit);
			setDetectionQuota(tier_data.detection_quota_limit);
			setPrice(tier_data.price);
			setPermissions((prev) => ({
				...prev,
				can_active_learn: tier_data.can_active_learn,
				can_reannotate: tier_data.can_reannotate,
				can_chatbot: tier_data.can_chatbot,
			}));
		}
	};

	const formatBytes = (storage, decimals = 2) => {
		if (!+storage) return "0 Bytes";
		const bytes = storage * 1024 * 1024;
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

	const SGDollar = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "SGD",
	});

	const retrieveChanges = (tier_data) => {
		var changes = {};
		if (tier_data.detection_quota_limit !== detectionQuota) {
			changes.detection_quota_limit = detectionQuota;
		}
		if (tier_data.price !== price) {
			changes.price = price;
		}
		if (tier_data.can_reannotate !== permissions.can_reannotate) {
			changes.can_reannotate = permissions.can_reannotate;
		}
		if (tier_data.can_chatbot !== permissions.can_chatbot) {
			changes.can_chatbot = permissions.can_chatbot;
		}
		if (tier_data.can_active_learn !== permissions.can_active_learn) {
			changes.can_active_learn = permissions.can_active_learn;
		}
		const final_storage = storageLimitUnit === "MB" ? storageLimit : storageLimit * 1024;
		if (tier_data.storage_limit !== final_storage) {
			changes.storage_limit = final_storage;
		}
		return changes;
	};

	const handleUpdate = () => {
		setIsUpdateLoading(true);
		var changes = retrieveChanges(data);
		changes.name = name;
		axios
			.patch("/api/admin/tier_management/update_tier", changes)
			.then((res) => {
				if (res.data.status_code === 200) {
					setupdateMessageModal(true);
				} else {
					alert("Failed to update tier, please try again...");
				}
			})
			.catch((error) => {
				console.log(error);
				alert("Failed to update tier, please try again...");
			})
			.then(() => setIsUpdateLoading(false));
	};

	const handleDelete = () => {
		setIsRemoveLoading(true);
		axios
			.delete("/api/admin/tier_management/delete_tier", {
				data: {
					name: name,
				},
			})
			.then((res) => {
				if (res.data.status_code !== 200) {
					alert(res.data.message);
				} else {
					setShowRemoveModal(false);
					setMessageModal(true);
				}
			})
			.catch((error) => {
				console.log(error);
			})
			.then(() => setIsRemoveLoading(false));
	};

	if (isLoading || data == null) {
		return <LoadingCard show={isLoading}>{`Loading tier '${name}'...`}</LoadingCard>;
	}

	return (
		<>
			{/* Removal */}
			<LoadingCard show={isRemoveLoading}>Removing Tier...</LoadingCard>
			<MessageModal
				state={messageModal}
				setState={() => {
					setMessageModal(false);
					window.location.reload();
				}}
			>
				Successfully removed tier '{name}'.
			</MessageModal>
			<ConfirmationModal state={showRemoveModal} setState={setShowRemoveModal} action={handleDelete}>
				<span className="w-5/6 mx-auto">Are you sure you want to delete these tiers?</span>
				<div className="mb-6 mx-auto my-4 w-5/6 max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
					<ul>
						<li className="text-gray-600 text-sm">{name}</li>
					</ul>
				</div>
			</ConfirmationModal>

			{/* Update */}
			<LoadingCard show={isUpdateLoading}>Updating Tier...</LoadingCard>
			<MessageModal
				state={updateMessageModal}
				setState={() => {
					setupdateMessageModal(false);
					window.location.reload();
				}}
			>
				Successfully updated tier '{name}'.
			</MessageModal>
			<ConfirmationModal state={showUpdateModal} setState={setShowUpdateModal} action={handleUpdate}>
				<span className="w-5/6 mx-auto">Are you sure you want to save these changes?</span>
				<div className="text-start mb-6 mx-auto my-4 w-5/6 max-h-36 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
					<ul>
						{Object.entries(retrieveChanges(data)).map((x) => {
							if (x[0] == "price") {
								return (
									<li className="text-gray-600 text-sm mb-1" key={x[0]}>
										<span className="font-semibold">{x[0]}: </span>
										<br />
										{`${SGDollar.format(data[x[0]])} -> ${SGDollar.format(x[1])}`}
									</li>
								);
							} else if (x[0] == "storage_limit") {
								return (
									<li className="text-gray-600 text-sm mb-1" key={x[0]}>
										<span className="font-semibold">{x[0]}: </span>
										<br />
										{`${formatBytes(data[x[0]])} -> ${formatBytes(x[1])}`}
									</li>
								);
							} else {
								return (
									<li className="text-gray-600 text-sm mb-1" key={x[0]}>
										<span className="font-semibold">{x[0]}: </span>
										<br />
										{`${data[x[0]]} -> ${x[1]}`}
									</li>
								);
							}
						})}
					</ul>
				</div>
			</ConfirmationModal>

			{/* main Modal */}
			<Modal
				className=""
				show={state}
				onClose={() => {
					setIsUpdating(false);
					resetEditable(data);
					setState(false);
				}}
				popup
			>
				<Modal.Header>
					<div className="pl-4 pt-4 text-2xl font-bold text-gray-900">
						{name}
						{isUpdating && <span className="text-yellow-500"> (UPDATING)</span>}
					</div>
				</Modal.Header>
				<Modal.Body className=" ">
					<div className="flex flex-col justify-center">
						<form
							onSubmit={(ev) => {
								ev.preventDefault();
								if (name.trim() != "" && price > 0 && detectionQuota > 0 && storageLimit > 0) {
									handleCreate();
								} else {
									alert("Incomplete data.");
								}
							}}
						>
							<div className="mt-4 flex flex-col gap-y-5">
								<div className="flex flex-col sm:flex-row gap-y-4 gap-x-6">
									<section className="flex flex-col gap-4 w-full sm:w-1/2">
										<div className="flex flex-col gap-1">
											<Label value="Detection Quota" />
											<TextInput
												type="number"
												min={1}
												color={"white"}
												required
												disabled={!isUpdating}
												className="min-w-64 rounded-lg"
												placeholder="Detection Quota of Tier Plan"
												icon={TbCapture}
												value={detectionQuota}
												onChange={(event) => {
													if (event.target.value > 0) {
														setDetectionQuota(event.target.valueAsNumber);
													}
												}}
											/>
										</div>
										<div className="flex flex-col gap-1">
											<Label value="Storage Limit" />
											{isUpdating ? (
												<div className="flex flex-row min-w-64">
													<input
														type="number"
														className="w-1/2 rounded-lg rounded-r-none"
														min={1}
														value={storageLimit}
														placeholder="Storage limit of Tier plan"
														required
														onChange={(event) => {
															if (event.target.value > 0) {
																setStorageLimit(event.target.valueAsNumber);
															}
														}}
													/>
													<Dropdown
														size=""
														className=""
														required
														label={storageLimitUnit}
														renderTrigger={() => (
															<Button color="gray" className="w-1/2 border-gray-500 text-black rounded-lg rounded-l-none ">
																{" "}
																{storageLimitUnit} <FaChevronDown className="absolute right-2  h-5 w-5" />{" "}
															</Button>
														)}
													>
														<Dropdown.Item onClick={() => setStorageLimitUnit("MB")}>MB</Dropdown.Item>
														<Dropdown.Item onClick={() => setStorageLimitUnit("GB")}>GB</Dropdown.Item>
													</Dropdown>
												</div>
											) : (
												<TextInput
													color={"white"}
													disabled={true}
													className="min-w-64 rounded-lg"
													icon={GrStorage}
													value={formatBytes(data.storage_limit)}
												/>
											)}
										</div>
										<div className="flex flex-col gap-1">
											<Label value="Price" />
											{name !== "FREE_USER" && isUpdating ? (
												<TextInput
													type="number"
													min={0.01}
													color={"white"}
													required
													disabled={!isUpdating}
													className="min-w-64 rounded-lg"
													value={price.toFixed(2)}
													step={0.01}
													addon={"S$"}
													placeholder="Price of Tier Plan"
													onChange={(event) => {
														if (event.target.value > 0) {
															setPrice(event.target.valueAsNumber);
														}
													}}
												/>
											) : (
												<TextInput
													color={"white"}
													disabled={true}
													className="min-w-64 rounded-lg"
													icon={IoPricetagsOutline}
													value={SGDollar.format(data.price) + " monthly"}
												/>
											)}
										</div>
									</section>
									<section className="flex flex-col gap-4 w-full sm:w-1/2">
										<div className="flex flex-col gap-1">
											<Label value="Number of Subscribers" />
											<TextInput
												disabled
												type="number"
												color={"white"}
												required
												className="min-w-64 rounded-lg"
												value={data.num_users}
												icon={FaRegUser}
												placeholder="Price of Tier Plan"
												onChange={(event) => {
													if (event.target.value > 0) {
														setPrice(event.target.valueAsNumber);
													}
												}}
											/>
										</div>
										<div className="flex flex-col gap-1">
											<Label value="Permissions" />
											<div className="flex flex-col border border-rounded p-4 rounded-lg border-gray-500 gap-3">
												{isUpdating && (
													<div className="flex items-center gap-2">
														<Checkbox
															id="select_all_permissions"
															checked={permissions.can_active_learn && permissions.can_chatbot && permissions.can_reannotate}
															onChange={(ev) =>
																setPermissions((prev) => ({
																	...prev,
																	can_active_learn: ev.target.checked,
																	can_reannotate: ev.target.checked,
																	can_chatbot: ev.target.checked,
																}))
															}
														/>
														<Label htmlFor="select_all_permissions" className="flex text-xs">
															Select All
														</Label>
													</div>
												)}
												<div className="flex items-center gap-2">
													<Checkbox
														disabled={!isUpdating}
														color={isUpdating ? "blue" : "failure"}
														id="reannotate"
														checked={permissions.can_reannotate}
														onChange={(ev) => setPermissions((prev) => ({ ...prev, can_reannotate: ev.target.checked }))}
													/>
													<Label htmlFor="reannotate" className="flex text-xs">
														Re-annotate Detection results
													</Label>
												</div>
												<div className="flex items-center gap-2">
													<Checkbox
														disabled={!isUpdating}
														color={isUpdating ? "blue" : "failure"}
														id="chatbot"
														checked={permissions.can_chatbot}
														onChange={(ev) => setPermissions((prev) => ({ ...prev, can_chatbot: ev.target.checked }))}
													/>
													<Label htmlFor="chatbot" className="flex text-xs">
														AI-powered Chat Bot for Q&A
													</Label>
												</div>
												<div className="flex items-center gap-2">
													<Checkbox
														disabled={!isUpdating}
														color={isUpdating ? "blue" : "failure"}
														id="active_learn"
														checked={permissions.can_active_learn}
														onChange={(ev) => setPermissions((prev) => ({ ...prev, can_active_learn: ev.target.checked }))}
													/>
													<Label htmlFor="active_learn" className="flex text-xs">
														Personalized Active Learning
													</Label>
												</div>
											</div>
										</div>
									</section>
								</div>
								{isUpdating ? (
									<section className="flex justify-center gap-5 mt-5">
										<Button
											color="failure"
											className="w-1/2 "
											onClick={() => {
												setIsUpdating(false);
												resetEditable(data);
											}}
										>
											<div className="flex flex-row justify-center items-center">
												<MdOutlineCancel className="text-lg mr-1" />
												Cancel
											</div>
										</Button>
										<Button
											disabled={Object.keys(retrieveChanges(data)).length == 0}
											className="w-1/2 bg-custom-green-2 hover:bg-custom-green-1 text-white ring-inset ring-custom-green-1"
											onClick={() => setShowUpdateModal(true)}
										>
											<div className="flex flex-row justify-center items-center">
												<MdOutlineSaveAlt className="text-lg mr-1" />
												Save Changes
											</div>
										</Button>
									</section>
								) : (
									<section className="flex justify-center gap-5 mt-5">
										<Button color="failure" className="w-1/2 " onClick={() => setShowRemoveModal(true)}>
											<div className="flex flex-row justify-center items-center">
												<IoTrashOutline className="text-lg mr-1" />
												Remove
											</div>
										</Button>
										<Button
											className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white ring-inset ring-bg-yellow-500 hover:ring-bg-yellow-600"
											onClick={() => setIsUpdating(true)}
										>
											<div className="flex flex-row justify-center items-center">
												<MdOutlineEdit className="text-lg mr-1" />
												Edit
											</div>
										</Button>
									</section>
								)}
							</div>
						</form>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}
export default ViewTierModal;
