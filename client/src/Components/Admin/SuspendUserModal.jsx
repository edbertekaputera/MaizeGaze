import { Button, Modal, Card, Label, Dropdown } from "flowbite-react";
import { FaUser } from "react-icons/fa";
import { useState, useRef, useContext } from "react";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import MessageModal from "../MessageModal";
import ConfirmationModal from "../ConfirmationModal";
import LoadingCard from "../LoadingCard";

function SuspendUserModal({ state, setState, selected }) {
	const [durationUnit, setDurationUnit] = useState("Days");
	const [duration, setDuration] = useState(1);
	const [reason, setReason] = useState("");
	const [endDate, setEndDate] = useState("");
	const [messageModal, setMessageModal] = useState(false);
	const [failedList, setFailedList] = useState([]);
	const [confirmationModal, setConfirmationModal] = useState(false);
	const [isSuspendLoading, setIsSuspendLoading] = useState(false);

	const onCloseModal = (x) => {
		setMessageModal(x);
		window.location.reload();
	};

	const handleSuspend = () => {
		const final_duration = durationUnit === "Days" ? duration : durationUnit === "Weeks" ? duration * 7 : duration * 30;
		setIsSuspendLoading(true);
		selected.forEach((email) => {
			axios
				.post("/api/admin/user_management/suspend_user", {
					email: email,
					reason: reason,
					duration: final_duration,
				})
				.then((res) => {
					if (res.data.status_code == 200) {
						if (endDate == "") {
							setEndDate(res.data.message);
						}
					} else {
						setFailedList((prev) => [...prev, email]);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		});
		if (failedList.length == selected.length) {
			alert("Failed to suspend, please try again...");
		} else {
			setState(false);
			setMessageModal(true);
		}
		setIsSuspendLoading(false);
	};

	const displayMessageModal = () => {
		return (
			<Modal id="suspend-status" show={messageModal} onClose={() => onCloseModal(false)} size="xl" popup>
				<Modal.Header />
				<Modal.Body>
					<div className="flex flex-col justify-between m-5">
						<h1 className="text-2xl text-center text-semibold">
							{`All selected users have been successfully suspended until `}
							<span className=" text-custom-green-1 font-bold">{endDate}</span>
						</h1>
						{failedList.length > 0 && (
							<div className="mt-4 flex flex-col justify-start">
								<span className="text-xl text-start">Except:</span>
								<div className="mt-4 w-full max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
									<ul>
										{failedList.map((email) => (
											<li className="text-gray-600 text-sm" key={email}>
												{email}
											</li>
										))}
									</ul>
								</div>
							</div>
						)}
					</div>
				</Modal.Body>
			</Modal>
		);
	};

	const displayListOfSelectedEmails = () => {
		let list_of_emails = [];
		selected.forEach((email) => {
			list_of_emails.push(
				<li className="text-gray-600 text-sm" key={email}>
					{email}
				</li>
			);
		});
		return <ul>{list_of_emails}</ul>;
	};

	return (
		<>
			{displayMessageModal()}
			<LoadingCard show={isSuspendLoading}>Suspending Selected Users...</LoadingCard>
			<ConfirmationModal state={confirmationModal} setState={setConfirmationModal} action={handleSuspend}>
				Confirm suspension on the following accounts:
				<div className=" mx-auto my-4 w-5/6 max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
					{displayListOfSelectedEmails()}
				</div>
			</ConfirmationModal>
			<Modal className="" show={state} onClose={() => setState(false)} size="md" popup>
				<Card className=" ">
					<div className="flex flex-col items-center">
						<h5 className="text-2xl font-bold text-gray-900 dark:text-white">Suspend Account(s) :</h5>
						<form
							onSubmit={(ev) => {
								ev.preventDefault();
								if (reason.trim() != "" && duration > 0) {
									setConfirmationModal(true);
								} else {
									alert("Incomplete data.");
								}
							}}
						>
							<div className="mt-4 flex flex-col gap-y-5">
								<div className="w-full max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
									{displayListOfSelectedEmails()}
								</div>
								<section className="flex flex-col w-full ">
									<Label htmlFor="reason" value="Reason" required />
									<textarea className="resize-none h-28 w-full rounded-lg" value={reason} onChange={(event) => setReason(event.target.value)} />
								</section>
								<section className="flex flex-col">
									<Label htmlFor="duration" value="Duration" />
									<div className="flex flex-row h-10">
										<input
											type="number"
											className="border rounded-lg rounded-r-none border-black w-20"
											min={1}
											value={duration}
											required
											onChange={(event) => setDuration(event.target.valueAsNumber)}
										/>
										<Dropdown
											size=""
											className=""
											required
											label={durationUnit}
											renderTrigger={() => (
												<Button color="gray" className="w-60 border-black text-black bg-white rounded-lg rounded-l-none ">
													{" "}
													{durationUnit} <FaChevronDown className="absolute right-2  h-5 w-5" />{" "}
												</Button>
											)}
										>
											<Dropdown.Item onClick={() => setDurationUnit("Days")}>Days</Dropdown.Item>
											<Dropdown.Item onClick={() => setDurationUnit("Weeks")}>Weeks</Dropdown.Item>
											<Dropdown.Item onClick={() => setDurationUnit("Months")}>Months</Dropdown.Item>
										</Dropdown>
									</div>
								</section>
								<section className="flex justify-center gap-5 mt-5">
									<Button color="failure" className="w-1/2 " onClick={() => setState(false)}>
										Cancel
									</Button>
									<Button type="submit" className="w-1/2 bg-custom-green-2 hover:bg-custom-green-1 text-white ring-inset ring-custom-green-1">
										Confirm
									</Button>
								</section>
							</div>
						</form>
					</div>
				</Card>
			</Modal>
		</>
	);
}
export default SuspendUserModal;
