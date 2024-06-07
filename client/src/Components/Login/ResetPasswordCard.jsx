import { Button, Card, Label, TextInput, Spinner } from "flowbite-react";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPasswordCard() {
	const [loading, setLoading] = useState(false);
	const [email, enterEmail] = useState("");
	const [success, setSuccess] = useState(false);
	const [emailError, setEmailError] = useState("");
	const navigate = useNavigate();

	const resetPassword = async (event) => {
		event.preventDefault();
		setLoading(true);
		const response = await axios
			.post("/api/authentication/init_reset_password", {
				email: email,
			})
			.catch((error) => {
				console.log(error);
			});
		if (response.data.status_code === 200) {
			handleSuccess();
		} else {
			handleError(response.data.message);
		}
		setLoading(false);
	};

	const handleSuccess = () => {
		setSuccess(true);
		setTimeout(() => {
			navigate("/login");
		}, 3000);
	};

	const handleError = (message) => {
		setEmailError(message);
	};

	const displayResetPasswordPage = () => {
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
						Your reset password link has been sent to your email {email}
					</Label>
				)}
				{!success && (
					<>
						<form
							className="flex flex-col gap-2"
							onSubmit={resetPassword}
						>
							<div>
								<div className="mb-2 block">
									<Label htmlFor="email" value="Your email" />
								</div>
								<TextInput
									id="email"
									type="email"
									placeholder="mymail@mail.com"
									autoComplete="email"
									required
									onChange={(event) => enterEmail(event.target.value)}
									color={emailError === "" ? "white" : "failure"}
									helperText={
										<span className="font-medium">{emailError}</span>
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
									"Reset Password"
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
					</>
				)}
			</Card>
		);
	};

	return displayResetPasswordPage();
}
