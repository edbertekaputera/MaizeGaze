import React, { useState, useContext, useEffect } from "react";
import { Button, Card, Modal, Avatar, TextInput, Progress, Label } from "flowbite-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import { MdEdit } from "react-icons/md";

const UserProfile = () => {
	const { userInfo } = useContext(AuthContext);
	const [usedStorageSize, setUsedStorageSize] = useState();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showSetModal, setShowSetModal] = useState(false);
	const [showPasswordVerification, setShowPasswordVerification] = useState(true);
	const [data, setData] = useState({
		name: "",
		type: "",
		detection_quota_limit: 0,
		total_detections: 0,
		status: "",
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		new_password: "",
		confirmPassword: "",
		errorMessage: "",
	});

	const [editName, setEditName] = useState(""); // Local state for edited name
	const [showNameEditModal, setShowNameEditModal] = useState(false);

	useEffect(() => {
		axios
			.get("/api/storage/get_storage_size")
			.then((res) => {
				if (res.status === 200) {
					setUsedStorageSize(res.data.storage_size);
				} else {
					console.log(res.status);
					alert("Something went wrong!");
					navigate("/user");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
				navigate("/user");
			});

		if (userInfo) {
			setData({
				name: userInfo.name,
				type: userInfo.type,
				detection_quota_limit: userInfo.detection_quota_limit,
				total_detections: userInfo.total_detections,
				status: userInfo.status,
			});
			setEditName(userInfo.name); // Initialize editName with current name
			setIsLoading(false);
		}
	}, [userInfo]);
	console.log(passwordData);
	useEffect(() => {
		if (passwordData.new_password.trim() !== "") {
			setPasswordData({
				...passwordData,
				errorMessage: passwordCheck(passwordData.new_password),
			});
		} else {
			setPasswordData({
				...passwordData,
				errorMessage: "",
			});
		}
	}, [passwordData.new_password]);

	const handlePassword = () => {
		setShowEditModal(true);
	};

	const setPassword = () => {
		setShowSetModal(true);
	};

	const handleSaveChanges = (updatedData) => {
		axios
			.patch("/api/user/update_profile", updatedData)
			.then((res) => {
				if (res.data.status_code === 200) {
					// Update local state upon successful save
					window.location.reload();
				} else {
					console.log(`${res.data.status_code}: ${res.data.message}`);
					alert(`Failed to update profile: ${res.data.message}`);
				}
			})
			.catch((error) => {
				if (error.response && error.response.data) {
					console.log("Error response data:", error.response.data);
					alert(`Error while updating profile: ${error.response.data.message}`);
				} else {
					console.log("Error:", error);
					alert("Error while updating profile.");
				}
			});
	};

	const formatBytes = (bytes, decimals = 2) => {
		if (!+bytes) return "0 Bytes";
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

	const verifyCurrentPassword = (event) => {
		event.preventDefault();
		const { currentPassword } = passwordData;

		axios
			.post("/api/authentication/verify_password", {
				password: currentPassword,
			})
			.then((response) => {
				if (response.data.status_code === 202) {
					setShowPasswordVerification(false);
					setPasswordData({
						...passwordData,
						errorMessage: "",
					});
				} else {
					setPasswordData({
						...passwordData,
						errorMessage: response.data.message,
					});
				}
			})
			.catch((error) => {
				console.log(error);
				setPasswordData({
					...passwordData,
					errorMessage: "Failed to verify password. Please try again.",
				});
			});
	};

	// Modified passwordCheck function
	const passwordCheck = (password) => {
		let checks = [];
		// Check if it's at least 8 characters long
		if (password.trim().length < 8) {
			checks.push("at least 8 characters");
		}
		// Check if it has at least one uppercase letter
		if (!/[A-Z]+/.test(password)) {
			checks.push("one uppercase letter");
		}
		// Check if it has at least one digit
		if (!/\d+/.test(password)) {
			checks.push("one digit");
		}
		// Set error message
		if (checks.length > 0) {
			if (checks.length === 1) {
				return `Password must include ${checks[0]}.`;
			} else if (checks.length === 2) {
				return `Password must include ${checks[0]} and ${checks[1]}.`;
			} else {
				const allButLast = checks.slice(0, -1).join(", ");
				const last = checks[checks.length - 1];
				return `Password must include ${allButLast}, and ${last}.`;
			}
		}
		return "";
	};

	// Modified updatePassword function
	const updatePassword = (event) => {
		event.preventDefault();
		const { new_password, confirmPassword } = passwordData;

		const passwordError = passwordCheck(new_password);
		if (passwordError.length > 0) {
			setPasswordData({
				...passwordData,
				errorMessage: passwordError,
			});
			return;
		}

		if (new_password !== confirmPassword) {
			setPasswordData({
				...passwordData,
				errorMessage: "Passwords do not match.",
			});
			return;
		}

		axios
			.patch("/api/user/update_password", {
				new_password,
			})
			.then((response) => {
				if (response.data.status_code == 200) {
					handleSuccess();
				} else {
					setPasswordData({
						...passwordData,
						errorMessage: response.data.message,
					});
				}
			})
			.catch((error) => {
				console.log(error);
				setPasswordData({
					...passwordData,
					errorMessage: "Failed to update password. Please try again.",
				});
			});
	};

	const handleSuccess = () => {
		setShowEditModal(false);
		setShowSetModal(false);
		setShowPasswordVerification(true);
		setPasswordData({
			currentPassword: "",
			new_password: "",
			confirmPassword: "",
			errorMessage: "",
		});
		alert("Password updated successfully!");
		window.location.reload();
	};

	const handleModalClose = () => {
		setShowEditModal(false);
		setShowSetModal(false);
		setShowPasswordVerification(true);
		setPasswordData({
			currentPassword: "",
			new_password: "",
			confirmPassword: "",
			errorMessage: "",
		});
	};

	const handleNameEdit = () => {
		setShowNameEditModal(true);
	};

	const handleNameSave = () => {
		const updatedData = { ...data, name: editName }; // Prepare updated data
		handleSaveChanges(updatedData); // Call save function
		setShowNameEditModal(false); // Close modal after save
	};

	const handleNameChange = (e) => {
		setEditName(e.target.value); // Update local state on name change
	};

	const handleManagePlan = () => {
		navigate("/user/plan_management"); // Navigate to plan management page
	};
	// console.log(userInfo);
	return (
		<div className="min-h-screen">
			<Card className="relative my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">My Account</h1>
				</header>
				<div className="flex flex-col sm:flex-row">
					<div className="flex flex-col w-full sm:w-1/2 justify-center items-center">
						<Avatar
							rounded
							placeholderInitials={
								data.name
									? data.name
											.split(" ")
											.map((val) => val[0].toUpperCase())
											.join("")
									: ""
							}
							size="xl"
							className="text-6xl"
						/>
						<br></br>
						<Button color="light" onClick={handleManagePlan} className="mt-4 sm:mt-0">
							Manage Your Plan
						</Button>
						<br></br>
						{userInfo.has_password ? (
							<Button color="failure" onClick={handlePassword}>
								Change Password
							</Button>
						) : (
							<Button color="success" onClick={setPassword}>
								Set Password
							</Button>
						)}
					</div>
					<div className="mt-4 px-4 flex flex-col w-full justify-center gap-4">
						<div className="flex flex-col relative">
							<label className="font-semibold mb-2">Name</label>
							<div className="flex items-center">
								<TextInput type="text" value={editName} onChange={handleNameChange} readOnly={!showNameEditModal} color={showNameEditModal ? "white" : "gray"} />
								{!showNameEditModal && (
									<Button className="ml-2" color="light" onClick={handleNameEdit}>
										<MdEdit size={18} />
									</Button>
								)}
								{showNameEditModal && (
									<Button className="ml-2" color="success" onClick={handleNameSave}>
										Save
									</Button>
								)}
							</div>
						</div>
						<div className="flex flex-col">
							<label className="font-semibold mb-2">Email</label>
							<TextInput type="text" value={userInfo.email} readOnly />
						</div>
						<div className="flex flex-row justify-between gap-4">
							<div className="flex flex-col w-1/2">
								<label className="font-semibold mb-2">Subscription</label>
								<TextInput type="text" value={data.type} readOnly />
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
									{formatBytes(usedStorageSize)} / {formatBytes(userInfo.storage_limit * Math.pow(1024, 2))}
									{` (${(Math.round((10000 * usedStorageSize) / (userInfo.storage_limit * Math.pow(1024, 2))) / 100).toFixed(2)}%)`}
								</span>
							</span>
							<Progress
								className="bg-custom-brown-3 text-white w-full"
								color="green"
								progress={Math.round((10000 * usedStorageSize) / (userInfo.storage_limit * Math.pow(1024, 2))) / 100}
								size="xl"
							/>
						</div>
					</div>
				</div>
			</Card>

			{/* Edit Password Modal */}
			<Modal show={showEditModal} size="4xl" onClose={handleModalClose}>
				<div className="rounded shadow-md">
					<Modal.Header>
						<h1 className="font-extrabold">Change Password</h1>
					</Modal.Header>
					<Modal.Body>
						{showPasswordVerification ? (
							<form onSubmit={verifyCurrentPassword}>
								<div className="flex flex-col">
									<label className="font-semibold mb-2">Current Password</label>
									<TextInput
										type="password"
										value={passwordData.currentPassword}
										onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
									/>
								</div>
								{passwordData.errorMessage && <p className="text-red-500 text-sm mt-2">{passwordData.errorMessage}</p>}
								<br></br>
								<Button type="submit" className="bg-custom-green-2 hover:bg-custom-green-1 focus:ring-4 focus:ring-custom-green-3">
									Verify
								</Button>
							</form>
						) : (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									updatePassword(e);
								}}
							>
								<div className="flex flex-col">
									<div className="mb-2 block">
										<Label htmlFor="password" value="Your new password" />
									</div>
									<TextInput
										id="password"
										type="password"
										placeholder="your new password"
										autoComplete="new-password"
										required
										value={passwordData.new_password}
										onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
										color={passwordData.errorMessage === "" ? "white" : "failure"}
										helperText={<span className="font-medium">{passwordData.errorMessage}</span>}
									/>
								</div>
								<br></br>
								<div className="flex flex-col">
									<div className="mb-2 block">
										<Label htmlFor="repassword" value="Retype your new password" />
									</div>
									<TextInput
										id="repassword"
										type="password"
										placeholder="retype your new password"
										autoComplete="new-password"
										required
										value={passwordData.confirmPassword}
										onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
										color={
											passwordData.confirmPassword.trim() === ""
												? "white"
												: passwordData.new_password !== passwordData.confirmPassword
												? "failure"
												: "success"
										}
										helperText={
											<span className="font-medium">
												{passwordData.confirmPassword.trim() === ""
													? ""
													: passwordData.new_password !== passwordData.confirmPassword
													? "Passwords do not match"
													: "Passwords match"}
											</span>
										}
									/>
								</div>
								<br></br>
								<Button
									type="submit"
									disabled={
										(passwordData.new_password.trim() == "") | (passwordData.errorMessage !== "") ||
										passwordData.new_password !== passwordData.confirmPassword
									}
									className="bg-custom-green-2 hover:bg-custom-green-1 focus:ring-4 focus:ring-custom-green-3"
								>
									Submit
								</Button>
							</form>
						)}
					</Modal.Body>
				</div>
			</Modal>

			{/* Set Password Modal */}
			<Modal show={showSetModal} size="4xl" onClose={handleModalClose}>
				<div className="rounded shadow-md">
					<Modal.Header>
						<h1 className="font-extrabold">Set Password</h1>
					</Modal.Header>
					<Modal.Body>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								updatePassword(e);
							}}
						>
							<div className="flex flex-col">
								<div className="mb-2 block">
									<Label htmlFor="password" value="Your new password" />
								</div>
								<TextInput
									id="password"
									type="password"
									placeholder="your new password"
									autoComplete="new-password"
									required
									value={passwordData.new_password}
									onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
									color={passwordData.errorMessage === "" ? "white" : "failure"}
									helperText={<span className="font-medium">{passwordData.errorMessage}</span>}
								/>
							</div>
							<br></br>
							<div className="flex flex-col">
								<div className="mb-2 block">
									<Label htmlFor="repassword" value="Retype your new password" />
								</div>
								<TextInput
									id="repassword"
									type="password"
									placeholder="retype your new password"
									autoComplete="new-password"
									required
									value={passwordData.confirmPassword}
									onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
									color={
										passwordData.confirmPassword.trim() === ""
											? "white"
											: passwordData.new_password !== passwordData.confirmPassword
											? "failure"
											: "success"
									}
									helperText={
										<span className="font-medium">
											{passwordData.confirmPassword.trim() === ""
												? ""
												: passwordData.new_password !== passwordData.confirmPassword
												? "Passwords do not match"
												: "Passwords match"}
										</span>
									}
								/>
							</div>
							<br></br>
							<Button
								disabled={
									(passwordData.new_password.trim() == "") | (passwordData.errorMessage !== "") ||
									passwordData.new_password !== passwordData.confirmPassword
								}
								type="submit"
								className="bg-custom-green-2 hover:bg-custom-green-1 focus:ring-4 focus:ring-custom-green-3"
							>
								Submit
							</Button>
						</form>
					</Modal.Body>
				</div>
			</Modal>
		</div>
	);
};

export default UserProfile;
