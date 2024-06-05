import axios from "axios";
import { Button, Card, Label, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function NewPasswordCard() {
	const params = useParams();
	const [loading, setLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [retypePassword, setRetypePassword] = useState("");
	const [success, setSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get("/api/authentication/verify_token", {
				params: { token: params.token },
			})
			.then((res) => {
				if (!res.data.valid) {
					alert(res.data.message);
					navigate("/");
				}
			})
			.catch((error) => {
				alert("Something went wrong!");
				navigate("/");
			});
	}, [params.token]);

	useEffect(() => {
		if (password.trim() !== "") {
			setErrorMessage(passwordCheck());
		} else {
			setErrorMessage("");
		}
	}, [password]);

	const passwordCheck = () => {
		let bool_flag = true;
		let checks = [];
		//  Check if more than 8 characters
		if (password.trim().length < 8) {
			checks.push("8 characters long");
		}
		// Check if has an uppercase alphabet
		if (!/[A-Z]+/.test(password)) {
			checks.push("one uppercase alphabet");
		}
		// Check if has a number
		if (!/[\d]+/.test(password)) {
			checks.push("one number");
		}
		// Set the error message
		if (checks.length > 0) {
			if (checks.length === 1) {
				return `Password must have at least ${checks[0]}.`;
			} else if (checks.length === 2) {
				return `Password must have at least ${checks[0]} and ${checks[1]}.`;
			} else {
				const allButLast = checks.slice(0, -1).join(", ");
				const last = checks[checks.length - 1];
				return `Password must have at least ${allButLast}, and ${last}.`;
			}
		}
		return "";
	};

	const updatePassword = (event) => {
		event.preventDefault();
		if (
			password.trim() !== "" &&
			password === retypePassword &&
			errorMessage === ""
		) {
			setLoading(true);
			axios
				.post("/api/authentication/update_password", {
					token: params.token,
					password: password,
				})
				.then((response) => {
					if (response.data.success) {
						handleSuccess();
					} else {
						alert(response.data.message);
					}
				})
				.catch((error) => {
					console.log(error);
				})
				.then(setLoading(false));
		}
	};

	const handleSuccess = () => {
		setSuccess(true);
		setTimeout(() => {
			navigate("/login");
		}, 3000);
	};

	return (
		<Card className="w-96 bg-custom-white ">
			<div className="mb-2 text-center block mx-4">
					<Label
						className="text-xl font-semibold"
						value="Reset Password"
					/>
				</div>
			{success && (
				<Label className="font-normal text-gray-700 dark:text-gray-400 text-center w-72 mx-auto">
					Your password has been updated.
				</Label>
			)}
			{!success && (
				<form className="flex flex-col gap-2" onSubmit={updatePassword}>
					<div className="mt-2">
						<div className="mb-2 block">
							<Label htmlFor="password" value="Your new password" />
						</div>
						<TextInput
							id="password"
							type="password"
							placeholder="your new password"
							autoComplete="new-password"
							required
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							color={errorMessage === "" ? "white" : "failure"}
							helperText={
								<span className="font-medium">{errorMessage}</span>
							}
						/>
					</div>
					<div className="mt-2">
						<div className="mb-2 block">
							<Label
								htmlFor="repassword"
								value="Retype your new password"
							/>
						</div>
						<TextInput
							id="repassword"
							type="password"
							placeholder="retype your new password"
							autoComplete="new-password"
							required
							value={retypePassword}
							onChange={(event) => setRetypePassword(event.target.value)}
							color={
								retypePassword.trim() === ""
									? "white"
									: password !== retypePassword
									? "failure"
									: "success"
							}
							helperText={
								<span className="font-medium">
									{retypePassword.trim() === ""
										? ""
										: password !== retypePassword
										? "Passwords do not match"
										: "Passwords match"}
								</span>
							}
						/>
					</div>
					<Button
						type="submit"
						className={`mt-2 mb-5 bg-custom-green-1 hover:bg-custom-green-2 ring-inset ring-custom-green-1 hover:ring-custom-green-2  ${
							loading ? "cursor-not-allowed opacity-50" : ""
						}`}
					>
						{loading ? (
							<div className="flex items-center">
								<Spinner
									aria-label="Spinner button example"
									size="sm"
								/>
								<span className="pl-3">Loading...</span>
							</div>
						) : (
							"Update Password"
						)}
					</Button>
					<div className="mb-2 block">
								<Label value="Remember Now? " />
								<Link
									to="/login"
									className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
								>
									Go back
								</Link>
							</div>
				</form>
			)}
		</Card>
	);
}

export default NewPasswordCard;
