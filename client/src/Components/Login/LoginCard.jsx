import React, { useState } from "react";
import { Card, Label, TextInput, Button } from "flowbite-react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaG, FaGithub } from "react-icons/fa6";
import axios from "axios";

function LoginCard() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [invalidMsg, setInvalidMsg] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		event.preventDefault();
		const response = await axios
			.post("/api/authentication/login", {
				email: email,
				password: password,
			})
			.catch((error) => {
				console.log(error);
			});

		if (response.data.status_code === 202) {
			if (!response.data.is_admin) {
				navigate("/user");
			} else {
				navigate("/administrator/user_management");
			}
		} else {
			setInvalidMsg(response.data.message);
		}
	};

	return (
		<Card className="bg-custom-white">
			<div className="mb-2 text-center block w-96 mx-4">
				<Label
					className="text-xl font-semibold"
					value="Sign in to your account"
				/>
			</div>
			<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
				<div>
					<div className="mb-2 block">
						<Label htmlFor="email" value="Email" />
					</div>
					<TextInput
						id="email"
						placeholder="user@email.com"
						required={true}
						type="email"
						autoComplete="email"
						onChange={(event) => setEmail(event.target.value)}
						color={invalidMsg === "" ? "white" : "failure"}
						helperText={
							<React.Fragment>
								<span className="font-medium">{invalidMsg}</span>
							</React.Fragment>
						}
					/>
				</div>
				<div>
					<div className="mb-2 block">
						<Label htmlFor="password1" value="Your password" />
					</div>
					<TextInput
						id="password1"
						type="password"
						required={true}
						autoComplete="current-password"
						onChange={(event) => setPassword(event.target.value)}
						color={invalidMsg === "" ? "white" : "failure"}
						helperText={
							<React.Fragment>
								<span className="font-medium">{invalidMsg}</span>
							</React.Fragment>
						}
					/>
					<div className="flex justify-end">
						<Link to="/reset_password" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
							Forgot password?
						</Link>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<Button
						type="submit"
						className="mt-2 bg-custom-green-1 hover:bg-custom-green-2"
					>
						Sign In
					</Button>
					<Button
						type="button"
						className="mt-2 border bg-white border-black hover:bg-gray-100 hover:border-gray-500"
						color={"white"}
						href={
							"/api/authentication/oauth/login/google"
						}
					>
						<FcGoogle size={20} className="mr-2" />
						Sign in with Google
					</Button>
					<Button
						type="button"
						className="mt-2 border bg-white border-black hover:bg-gray-100 hover:border-gray-500"
						color={"white"}
						href={
							"/api/authentication/oauth/login/github"
						}
					>
						<FaGithub size={20} className="mr-2" />
						Sign in with GitHub
					</Button>
				</div>

				<div className="mb-2 block">
					<Label value="Not registered? " />
					<Link
						to="/register"
						className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
					>
						Create account
					</Link>
				</div>
			</form>
		</Card>
	);
}

export default LoginCard;
