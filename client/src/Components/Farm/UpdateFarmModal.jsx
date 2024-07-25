import React, { useEffect, useState } from "react";
import { Modal, Label, TextInput, Textarea, Button, Dropdown, Spinner } from "flowbite-react";
import { FaChevronDown } from "react-icons/fa";
import { MdAddCircle, MdOutlineCancel, MdOutlineSaveAlt } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import Select from "react-select";
import axios from "axios";
import ConfirmationModal from "../ConfirmationModal";
import MessageModal from "../MessageModal";
import { set } from "date-fns";
import LoadingCard from "../LoadingCard";

function UpdateFarmModal({ state, setState, farm }) {
	const [countries, setCountries] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState({});
	const [patches, setPatches] = useState([]);
	const [city, setCity] = useState("");
	const [address, setAddress] = useState("");
	const [description, setDescription] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [messageModal, setMessageModal] = useState(false);
	const [changes, setChanges] = useState({});

	const handleAddPatch = () => {
		const newPatch = { name: "", land_size: 0, sizeUnit: "mu" };
		setPatches([...patches, newPatch]);
	};

	const handleRemovePatch = (id) => {
		if (patches.length > 1) {
			setPatches(patches.filter((patch, index) => index !== id));
		}
	};

	const handleInputChange = (id, field, value) => {
		setPatches(patches.map((patch, index) => (index === id ? { ...patch, [field]: value } : patch)));
	};

	const convertSize = (size, sizeUnit) => {
		if (isNaN(size) || size === null) {
			return 0;
		}

		switch (sizeUnit) {
			case "mu":
				return parseFloat((size * 1).toFixed(2));
			case "acre":
				return parseFloat((size * 6.07).toFixed(2));
			case "ha":
				return parseFloat((size * 15).toFixed(2));
			default:
				console.error("Invalid size unit");
				return 0;
		}
	};

	const getCountry = (selectedCountry) => {
		if (selectedCountry && selectedCountry.label) {
			const parts = selectedCountry.label.split(" ");
			return parts.slice(1).join(" ");
		}
		return null;
	};

	const isButtonDisabled =
		Object.keys(changes).length === 0 ||
		(changes.patches && changes.patches.length === 0 && (!changes.name || changes.name === farm.name) && (!changes.city || changes.city === farm.city));

	const retrieveChanges = (data) => {
		const changes = {};
		const countryName = getCountry(selectedCountry);
		if (data.country !== countryName) {
			changes.country = countryName;
		}
		if (data.city !== city) {
			changes.city = city;
		}
		if (data.address !== address) {
			changes.address = address;
		}
		if (data.description !== description) {
			changes.description = description;
		}

		changes.patches = [];

		for (let newPatch of patches) {
			const dataPatch = data.patches.find((p) => p.patch_id === newPatch.patch_id);

			const new_size = convertSize(newPatch.land_size, newPatch.sizeUnit);

			if (dataPatch) {
				if (dataPatch.name !== newPatch.name || dataPatch.land_size !== new_size) {
					changes.patches.push({
						name: newPatch.name,
						patch_id: newPatch.patch_id,
						land_size: new_size,
						deleted: false,
					});
				}
			} else {
				changes.patches.push({
					name: newPatch.name,
					land_size: new_size,
					deleted: false,
				});
			}
		}

		for (let dataPatch of data.patches) {
			const newPatch = patches.find((p) => p.patch_id === dataPatch.patch_id);

			if (!newPatch) {
				changes.patches.push({
					name: dataPatch.name,
					patch_id: dataPatch.patch_id,
					land_size: dataPatch.land_size,
					deleted: true,
				});
			}
		}
		return changes;
	};

	const handleUpdate = () => {
		const changes = retrieveChanges(farm);
		changes.name = farm.name;

		const sendData = {
			...changes,
			patches: (changes.patches || []).map((patch) => {
				const originalPatch = farm.patches.find((p) => p.patch_id === patch.patch_id);
				return {
					...patch,
					patch_id: originalPatch ? originalPatch.patch_id : null,
				};
			}),
		};

		axios
			.patch("/api/user/farm/update_farm", sendData)
			.then((res) => {
				if (res.data.status_code === 200) {
					setMessageModal(true);
				} else {
					alert(res.data.message);
					window.location.reload();
				}
			})
			.catch((error) => {
				console.error("Error updating farm", error);
				alert("Failed to update farm, please try again...");
			});
	};

	useEffect(() => {
		fetch("https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code")
			.then((response) => response.json())
			.then((data) => {
				setCountries(data.countries);
				const country = data.countries.find((c) => c.label.includes(farm.country));
				setSelectedCountry(country);
			});
	}, [farm]);

	useEffect(() => {
		if (state) {
			setIsLoading(true);
			setCity(farm.city);
			setAddress(farm.address);
			setDescription(farm.description);
			const patchArray = Array.isArray(farm.patches)
				? farm.patches.map((patch, index) => ({
						...patch,
						sizeUnit: patch.sizeUnit || "mu",
				  }))
				: [];
			setPatches(patchArray);
			setIsLoading(false);
		}
	}, [farm, state]);

	useEffect(() => {
		const newChanges = retrieveChanges(farm);
		setChanges(newChanges);
	}, [farm, selectedCountry, city, address, description, patches]);

	if (isLoading || farm == null) {
		return <LoadingCard show={isLoading}>{`Loading...`}</LoadingCard>;
	}

	return (
		<>
			<MessageModal
				state={messageModal}
				setState={() => {
					setMessageModal(false);
					window.location.reload();
				}}
			>
				Successfully updated farm '{farm.name}'.
			</MessageModal>

			<ConfirmationModal state={showUpdateModal} setState={setShowUpdateModal} action={handleUpdate}>
				<span className="w-5/6 mx-auto">Are you sure you want to save these changes?</span>
				<div className="text-start mb-6 mx-auto my-4 w-5/6 max-h-36 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900">
					<ul>
						{Object.entries(retrieveChanges(farm)).map(([key, value]) => {
							if (key === "patches") {
								if (Array.isArray(value) && value.length > 0) {
									return (
										<li key={key} className="text-gray-600 text-sm">
											<span className="font-semibold">{key.toUpperCase()}: </span>
											<br />
											{value.map((item, index) => (
												<div key={index} className="ml-4">
													{item.deleted ? (
														<div className="text-red-500">
															<p className="font-semibold">DELETE: </p>
															{item.name}, {item.land_size} mu
														</div>
													) : (
														<div>
															<p className="font-semibold">ADD or UPDATE: </p>
															{item.name}, {item.land_size} mu
														</div>
													)}
												</div>
											))}
										</li>
									);
								}
							} else {
								return (
									<li key={key} className="text-gray-600 text-sm">
										<span className="font-semibold">{key.toUpperCase()}: </span>
										<br />
										{farm[key]} -&gt; {value}
									</li>
								);
							}
							return null;
						})}
					</ul>
				</div>
			</ConfirmationModal>

			<Modal show={state} size="4xl" onClose={() => setState(null)} popup>
				<div className="rounded shadow-md overflow-y-auto">
					<Modal.Header>
						<div className="pl-4 pt-4 text-2xl font-bold text-gray-900 dark:text-white">{farm.name}</div>
					</Modal.Header>
					<Modal.Body>
						<div className="flex flex-col justify-center">
							<form
								onSubmit={(ev) => {
									ev.preventDefault();
									if (
										getCountry(selectedCountry) != "" &&
										city.trim() != "" &&
										address.trim() != "" &&
										description.trim() != "" &&
										patches.length > 0
									) {
										setShowUpdateModal(true);
									} else {
										alert("Incomplete data.");
									}
								}}
							>
								<div className="mt-4 flex flex-col gap-y-5">
									<section className="flex flex-col gap-4">
										<div className="flex flex-col sm:flex-row gap-x-5 gap-4">
											<div className="flex flex-col gap-2 sm:w-1/2">
												<Label value="Country" />
												<Select
													required
													options={countries}
													value={selectedCountry}
													placeholder="Select country"
													className="rounded-lg"
													onChange={(selectedOption) => setSelectedCountry(selectedOption)}
												/>
											</div>
											<div className="flex flex-col gap-2 sm:w-1/2">
												<Label value="City" />
												<TextInput
													required
													color={"white"}
													value={city}
													className="rounded-lg"
													placeholder="City of the farm"
													onChange={(event) => setCity(event.target.value)}
												/>
											</div>
										</div>
										<div className="flex flex-col gap-2">
											<Label value="Address" />
											<Textarea
												required
												color={"white"}
												value={address}
												className="rounded-lg"
												placeholder="Address of the farm"
												onChange={(event) => setAddress(event.target.value)}
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Label value="Description" />
											<Textarea
												required
												color={"white"}
												value={description}
												className="rounded-lg h-32"
												placeholder="Write a brief description of the farm..."
												onChange={(event) => setDescription(event.target.value)}
											/>
										</div>
										<div className="flex flex-row items-center justify-between">
											<header className="text-xl font-bold text-gray-900 dark:text-white">PATCHES</header>
											<span className="text-sm">
												Total size:{" "}
												<span className="font-bold">
													{patches.reduce((total, patch) => total + convertSize(parseFloat(patch.land_size), patch.sizeUnit), 0)} mu
												</span>
											</span>
										</div>
										<div className="flex flex-col gap-2">
											{patches.map((patch, index) => (
												<div key={index} className="flex flex-col gap-2 pb-2">
													<div className="flex flex-row items-center justify-between">
														<span className="flex-wrap">{`PATCH ${index + 1}`}</span>
														<span className="flex-grow border-t border-gray-300 mx-4"></span>
														{patches.length > 1 && (
															<Button className="px-2" color="" onClick={() => handleRemovePatch(index)}>
																<FiTrash2 size={25} />
															</Button>
														)}
													</div>
													<div className="flex flex-col sm:flex-row gap-x-5 gap-4">
														<div className="flex flex-col gap-2 sm:w-1/2">
															<Label value="Patch Name" />
															<TextInput
																required
																color={"white"}
																value={patch.name}
																className="rounded-lg"
																placeholder="Name of the patch"
																onChange={(event) => handleInputChange(index, "name", event.target.value)}
															/>
														</div>
														<div className="flex flex-col gap-2 sm:w-1/2">
															<Label value="Patch Size" />
															<div className="flex flex-row min-w-64">
																<input
																	required
																	type="text"
																	color={"white"}
																	value={patch.land_size}
																	className="w-8/12 rounded-lg rounded-r-none"
																	placeholder="Size of the patch"
																	onChange={(event) => {
																		const newSize = event.target.value;
																		const numericValue = Number(newSize);
																		if (!isNaN(numericValue) || newSize === "") {
																			handleInputChange(index, "land_size", numericValue);
																		}
																	}}
																/>
																<Dropdown
																	required
																	label={patch.sizeUnit}
																	onChange={(value) => handleInputChange(index, "sizeUnit", value)}
																	renderTrigger={() => (
																		<Button color="gray" className="w-4/12 border-gray-500 text-black rounded-lg rounded-l-none text-center">
																			{patch.sizeUnit}
																			<FaChevronDown className="absolute right-2  h-5 w-5" />
																		</Button>
																	)}
																>
																	<Dropdown.Item onClick={() => handleInputChange(index, "sizeUnit", "mu")}>mu</Dropdown.Item>
																	<Dropdown.Item onClick={() => handleInputChange(index, "sizeUnit", "acre")}>acre</Dropdown.Item>
																	<Dropdown.Item onClick={() => handleInputChange(index, "sizeUnit", "ha")}>ha</Dropdown.Item>
																</Dropdown>
															</div>
														</div>
													</div>
												</div>
											))}
											<Button className="bg-custom-brown-1 text-white mt-5" onClick={handleAddPatch}>
												<div className="flex flex-row justify-center items-center">
													<MdAddCircle className="text-lg mr-1" />
													Add Patch
												</div>
											</Button>
										</div>
									</section>
									<section className="flex flex-col sm:flex-row justify-center gap-5 mt-5">
										<Button color="failure" className="sm:w-1/2" onClick={() => setState(false)}>
											<div className="flex flex-row justify-center items-center">
												<MdOutlineCancel className="text-lg mr-1" />
												Cancel
											</div>
										</Button>
										<Button
											disabled={isButtonDisabled}
											className="w-1/2 bg-custom-green-2 hover:bg-custom-green-1 text-white ring-inset ring-custom-green-1"
											onClick={() => {
												let flag = false;
												for (let i = 0; i < patches.length; i++) {
													const p = patches[i];
													if (p.land_size <= 0 || p.land_size === "") {
														flag = true;
														alert(`Innapropriate Land Size on Patch ${i + 1}`);
														break;
													}
													if (p.name.trim() === "") {
														flag = true;
														alert(`Empty Name on Patch ${i + 1}`);
														break;
													}
												}
												if (!flag) {
													setShowUpdateModal(true);
												}
											}}
										>
											<div className="flex flex-row justify-center items-center">
												<MdOutlineSaveAlt className="text-lg mr-1" />
												Save Changes
											</div>
										</Button>
									</section>
								</div>
							</form>
						</div>
					</Modal.Body>
				</div>
			</Modal>
		</>
	);
}

export default UpdateFarmModal;
