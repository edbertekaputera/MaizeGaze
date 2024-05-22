import React, { useState, useContext } from "react";
import axios from "axios";
import { Card, Label, TextInput, Button } from "flowbite-react";
import { useNavigate, Link } from "react-router-dom";
import LoadingCard from "../LoadingCard";

function SignUpCard() {
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [rePassword, setRePassword] = useState("");
	const [email, setEmail] = useState("");
	const [emailError, setemailError] = useState("");
	const [nameError, setNameError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	const validateSubmit = async (event) => {
		event.preventDefault();
		await validateEmail();
		validateName();
		// If no error
		if (nameError === "" && emailError === "") {
			setIsLoading(true);
			await axios
				.post("/api/authentication/register", {
					name: name,
					email: email,
					password: password,
				})
				.then((res) => {
					if (res.data.status_code === 201) {
						setIsLoading(false);
						navigate("/user");
					}
				})
				.catch((error) => {
					console.log(error);
				});
			setIsLoading(false);
		}
	};

	const emailAlreadyExist = async (email) => {
		// API Call
		const response = await axios
			.get(`/api/authentication/check_exist_email/${email}`)
			.catch((error) => {
				console.log(error);
				return true;
			});
		return response.data.value;
	};

	const validateEmail = async () => {
		if (email.trim() === "") {
			setemailError("Email cannot be blank");
		} else if (await emailAlreadyExist(email)) {
			setemailError("Email is taken");
		} else {
			setemailError("");
		}
	};

	const validateName = () => {
		if (name.trim() === "") {
			setNameError("Name cannot be blank");
		} else {
			setNameError("");
		}
	};

	return (
		<>
			<LoadingCard show={isLoading}>
				Registering your account... Please wait!
			</LoadingCard>
			<Card className="bg-custom-white">
				<div className="mb-2 text-center block w-96 mx-4">
					<Label
						className="text-xl font-semibold"
						value="Create an account"
					/>
				</div>
				<form
					className="flex flex-col gap-4 w-full"
					onSubmit={validateSubmit}
				>
					<div>
						<div className="mb-2 block">
							<Label htmlFor="userName" value="Name" />
						</div>
						<TextInput
							id="userName"
							placeholder="John Doe"
							required={true}
							onBlur={() => validateName()}
							onChange={(event) => {
								setName(event.target.value);
							}}
							color={nameError === "" ? "white" : "failure"}
							helperText={
								<React.Fragment>
									<span className="font-medium">{nameError}</span>
								</React.Fragment>
							}
						/>
					</div>
					<div>
						<div className="mb-2 block">
							<Label htmlFor="email" value="Email" />
						</div>
						<TextInput
							id="email"
							placeholder="john_doe@gmail.com"
							required={true}
							onBlur={(event) => {
								validateEmail();
							}}
							onChange={(event) => {
								setEmail(event.target.value);
							}}
							color={emailError === "" ? "white" : "failure"}
							helperText={
								<React.Fragment>
									<span className="font-medium">{emailError}</span>
								</React.Fragment>
							}
						/>
					</div>
					<div>
						<div className="mb-2 block">
							<Label htmlFor="password" value="Password" />
						</div>
						<TextInput
							id="password"
							type="password"
							required={true}
							color={"white"}
							onBlur={(event) => setPassword(event.target.value)}
						/>
					</div>
					<div>
						<div className="mb-2 block">
							<Label htmlFor="rePassword" value="Retype Password" />
						</div>
						<TextInput
							id="rePassword"
							type="password"
							required={true}
							onChange={(event) => setRePassword(event.target.value)}
							color={
								rePassword.trim() === ""
									? "white"
									: password !== rePassword
									? "failure"
									: "success"
							}
							helperText={
								<React.Fragment>
									<span className="font-medium">
										{rePassword.trim() === ""
											? ""
											: password !== rePassword
											? "Passwords do not match"
											: "Passwords match"}
									</span>
								</React.Fragment>
							}
						/>
					</div>
					<Button
						type="submit"
						className="mt-2 bg-custom-green-1 hover:bg-custom-green-2"
					>
						Create Account
					</Button>
					<div className="mb-2 block">
						<Label value="Already have an account? " />
						<Link
							to="/login"
							className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
						>
							Sign In
						</Link>
					</div>
				</form>
			</Card>
		</>
	);
}

export default SignUpCard;
