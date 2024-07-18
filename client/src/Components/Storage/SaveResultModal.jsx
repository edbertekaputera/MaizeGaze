import axios from "axios";
import { Button, Label, Modal, Select, TextInput, Textarea } from "flowbite-react";
import React, { useEffect, useMemo, useState } from "react";
import { MdCancel, MdOutlineSaveAlt } from "react-icons/md";
import MessageModal from "../MessageModal";

function SaveResultModal({ state, setState, file, results, post_save_action }) {
	const [name, setName] = useState("");
	const [patches, setPatches] = useState([]);
	const [description, setDescription] = useState("");
	const [selectedFarms, setSelectedFarms] = useState("");
	const [selectedPatch, setSelectedPatch] = useState("");
	const [showMessageModal, setShowMessageModal] = useState(false);

	useEffect(() => {
		if (state) {
			axios
				.get("/api/user/farm/query_all_patches_owned")
				.then((res) => {
					if (res.status === 200) {
						setPatches(res.data.patches);
						setSelectedFarms(res.data.patches[0].farm_name);
						setSelectedPatch(res.data.patches[0].patch_id);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}, [state]);

	const uniqueFarms = useMemo(() => {
		const farms = [...new Set(patches.map((item) => item.farm_name))];
		return farms.map((farm) => (
			<option key={farm} value={farm}>
				{farm}
			</option>
		));
	}, [patches]);

	const cropPatches = useMemo(() => {
		if (!selectedFarms) return [];
		return patches
			.filter((item) => item.farm_name === selectedFarms)
			.map((f) => (
				<option key={f.patch_id} value={f.patch_id}>
					{f.patch_name}
				</option>
			));
	}, [patches, selectedFarms]);

	const handleSave = (event) => {
		event.preventDefault();
		let formData = new FormData();
		formData.append("image", file);
		formData.append("annotations", JSON.stringify(results.annotations));
		formData.append("tassel_count", results.tassel_count);
		formData.append("farm_name", selectedFarms);
		formData.append("farm_patch_id", selectedPatch);
		formData.append("name", name);
		formData.append("description", description);
		console.log(results);

		axios
			.post("/api/storage/save", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.then((res) => {
				if (res.data.success) {
					setShowMessageModal(true);
				} else {
					alert("Error while saving...");
				}
			})
			.catch((error) => {
				console.log(error);
				alert("Error while saving...");
			});
	};

	return (
		<>
			<MessageModal
				state={showMessageModal}
				setState={(bool) => {
					setName("");
					setDescription("");
					setSelectedFarms(patches[0].farm_name);
					setSelectedPatch(patches[0].patch_id);
					setShowMessageModal(bool);
					setState(bool);
					post_save_action();
				}}
			>
				Successfully saved!
			</MessageModal>
			<Modal show={state} size="lg" onClose={() => setState(false)} popup>
				<div className="rounded shadow-md">
					<Modal.Header>
						<h1 className="text-2xl">Save Detection Result</h1>
					</Modal.Header>

					<Modal.Body>
						<form className="flex flex-col gap-4" onSubmit={handleSave}>
							<div className="flex flex-col gap-1">
								<Label htmlFor="name_input">Name</Label>
								<TextInput id="name_input" required value={name} onChange={(ev) => setName(ev.target.value)} />
							</div>
							<div className="flex flex-row justify-between gap-4">
								<div className="flex flex-col gap-1 w-1/2">
									<Label htmlFor="farm_input">Farm</Label>
									<Select id="farm_input" required value={selectedFarms} onChange={(ev) => setSelectedFarms(ev.target.value)}>
										{uniqueFarms}
									</Select>
								</div>
								<div className="flex flex-col gap-1 w-1/2">
									<Label htmlFor="farm_input">Crop Patch</Label>
									<Select id="farm_input" required value={selectedFarms} onChange={(ev) => setSelectedFarms(ev.target.value)}>
										{cropPatches}
									</Select>
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<Label htmlFor="description_input">Description</Label>
								<Textarea id="description_input" required value={description} onChange={(ev) => setDescription(ev.target.value)} maxLength={250} />
							</div>
							<div className="flex justify-between gap-4 mt-3">
								<Button
									className="w-1/2"
									color={"failure"}
									type="button"
									onClick={() => {
										setState(false);
									}}
								>
									<div className="flex flex-row justify-center items-center gap-2 text-md pl-6 pr-8">
										<MdCancel size={18} />
										Cancel
									</div>
								</Button>
								<Button
									className="w-1/2 bg-custom-green-1 hover:bg-custom-green-2"
									type="submit"
									disabled={selectedFarms === "" || !selectedFarms || !file || !results}
								>
									<div className="flex flex-row justify-center items-center gap-2 text-md pl-6 pr-8">
										<MdOutlineSaveAlt size={18} />
										Save
									</div>
								</Button>
							</div>
						</form>
					</Modal.Body>
				</div>
			</Modal>
		</>
	);
}

export default SaveResultModal;
