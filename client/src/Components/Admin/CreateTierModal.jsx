import { Button, Modal, Card, Label, Dropdown, TextInput, Checkbox, Spinner } from "flowbite-react";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import MessageModal from "../MessageModal";
import LoadingCard from "../LoadingCard";
import { MdOutlineCancel } from "react-icons/md";
import { IoCreateOutline } from "react-icons/io5";

function CreateTierModal({ state, setState }) {
	// Attributes
	const [storageLimitUnit, setStorageLimitUnit] = useState("GB");
	const [storageLimit, setStorageLimit] = useState(1);
	const [name, setName] = useState("");
	const [detectionQuota, setDetectionQuota] = useState(1);
	const [price, setPrice] = useState(1.0);
	const [permissions, setPermissions] = useState({
		can_reannotate: false,
		can_chatbot: false,
		can_active_learn: false,
		can_diagnose: false,
	});

	const [messageModal, setMessageModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const onCloseModal = (x) => {
		setMessageModal(x);
		window.location.reload();
	};

	const handleCreate = () => {
		const final_storage = storageLimitUnit === "MB" ? storageLimit : storageLimit * 1024;
		setIsLoading(true);
		axios
			.post("/api/admin/tier_management/create_tier", {
				name: name,
				detection_quota_limit: detectionQuota,
				storage_limit: final_storage,
				price: price,
				can_reannotate: permissions.can_reannotate,
				can_chatbot: permissions.can_chatbot,
				can_active_learn: permissions.can_active_learn,
				can_diagnose: permissions.can_diagnose,
			})
			.then((res) => {
				if (res.data.status_code === 201) {
					setMessageModal(true);
				} else {
					alert(res.data.message);
				}
			})
			.catch((error) => {
				console.log(error);
				alert("Failed to create tier, please try again...");
			})
			.then(() => setIsLoading(false));
	};

	return (
		<>
			<MessageModal state={messageModal} setState={onCloseModal}>{`The '${name}' tier has been created.`}</MessageModal>
			<Modal className="" show={state} onClose={() => setState(false)} popup>
				<Modal.Header>
					<div className="pl-4 pt-4 text-2xl font-bold text-gray-900 dark:text-white">Create New Tier</div>
				</Modal.Header>
				<Modal.Body className="">
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
							{isLoading ? (
								<div className="flex flex-col justify-center mb-2 items-center">
									<h3 className="mb-5 text-xl font-normal text-gray-600">Creating Tier...</h3>
									<Spinner size={"xl"} color={"success"} />
								</div>
							) : (
								<div className="mt-4 flex flex-col gap-y-5">
									<div className="flex flex-col sm:flex-row gap-y-4 gap-x-6">
										<section className="flex flex-col gap-4 w-full sm:w-1/2">
											<div className="flex flex-col gap-1">
												<Label value="Tier Name" />
												<TextInput
													required
													color={"white"}
													className="min-w-64 rounded-lg"
													value={name}
													placeholder="Name of Tier Plan"
													onChange={(event) => setName(event.target.value)}
												/>
											</div>
											<div className="flex flex-col gap-1">
												<Label value="Detection Quota" />
												<TextInput
													type="number"
													min={1}
													color={"white"}
													required
													className="min-w-64 rounded-lg"
													placeholder="Detection Quota of Tier Plan"
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
												<div className="flex flex-row min-w-64">
													<input
														type="number"
														className="w-7/12 rounded-lg rounded-r-none"
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
															<Button color="gray" className="w-5/12 border-gray-500 text-black rounded-lg rounded-l-none text-center">
																{storageLimitUnit} <FaChevronDown className="absolute right-2  h-5 w-5" />
															</Button>
														)}
													>
														<Dropdown.Item onClick={() => setStorageLimitUnit("MB")}>MB</Dropdown.Item>
														<Dropdown.Item onClick={() => setStorageLimitUnit("GB")}>GB</Dropdown.Item>
													</Dropdown>
												</div>
											</div>
										</section>
										<section className="flex flex-col gap-4 w-full sm:w-1/2">
											<div className="flex flex-col gap-1">
												<Label value="Price" />
												<TextInput
													type="number"
													min={0.01}
													color={"white"}
													required
													className="min-w-64 rounded-lg"
													value={price}
													step={0.01}
													addon={"S$"}
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
												<div className="flex flex-col border border-rounded p-4 rounded-lg border-gray-500 gap-3 overflow-y-auto max-h-32">
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
																	can_diagnose: ev.target.checked,
																}))
															}
														/>
														<Label htmlFor="select_all_permissions" className="flex text-xs">
															Select All
														</Label>
													</div>
													<div className="flex items-center gap-2">
														<Checkbox
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
															id="active_learn"
															checked={permissions.can_active_learn}
															onChange={(ev) => setPermissions((prev) => ({ ...prev, can_active_learn: ev.target.checked }))}
														/>
														<Label htmlFor="active_learn" className="flex text-xs">
															Personalized Active Learning
														</Label>
													</div>
													<div className="flex items-center gap-2">
														<Checkbox
															id="doctor"
															checked={permissions.can_diagnose}
															onChange={(ev) => setPermissions((prev) => ({ ...prev, can_diagnose: ev.target.checked }))}
														/>
														<Label htmlFor="doctor" className="flex text-xs">
															Maize Plant Disease Diagnosis
														</Label>
													</div>
												</div>
											</div>
										</section>
									</div>
									<section className="flex flex-col sm:flex-row justify-center gap-5 mt-5">
										<Button color="failure" className="sm:w-1/2 " onClick={() => setState(false)}>
											<div className="flex flex-row justify-center items-center">
												<MdOutlineCancel className="text-lg mr-1" />
												Cancel
											</div>
										</Button>
										<Button type="submit" className="sm:w-1/2 bg-custom-green-2 hover:bg-custom-green-1 text-white ring-inset ring-custom-green-1">
											<div className="flex flex-row justify-center items-center">
												<IoCreateOutline className="text-lg mr-1" />
												Create
											</div>
										</Button>
									</section>
								</div>
							)}
						</form>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}
export default CreateTierModal;
