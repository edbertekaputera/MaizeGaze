import React, { useContext, useState } from "react";
import { Card, Label, Button } from "flowbite-react";
import axios from "axios";
import { AuthContext } from "../Authentication/PrivateRoute";
import LoadingCard from "../LoadingCard";

function ResendActivatioNCard() {
	const [buttonTimer, setButtonTimer] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const { userInfo } = useContext(AuthContext);

	const handleResend = async () => {
		setIsLoading(true);
		await axios
			.post("/api/authentication/resend_activation_email")
			.catch((error) => {
				console.log(error);
			});
		setIsLoading(false);
		setButtonTimer(30);
		var myInterval = setInterval(() => {
			return setButtonTimer((prev) => prev - 1);
		}, 1000);

		setTimeout(() => {
			clearInterval(myInterval);
		}, 30000);
	};

	const encryptedEmail = () => {
		let email = userInfo.email;
		let splitted = email.split("@");
		let hashed_name = splitted[0].substring(0, 2) + "*".repeat(8);
		return hashed_name + "@" + splitted[1];
	};

	return (
		<>
			<LoadingCard show={isLoading}>Sending Email...</LoadingCard>
			<Card>
				<div className="flex flex-col gap-3">
					<Label
						className="text-xl mb-2 text-center"
						value="Please Activate your Account"
					/>
					<p>
						To activate your account, you need to verify your email
						address. <br />
						We have sent you an activation email to your email address{" "}
						{encryptedEmail()}
					</p>
					<span>
						You can resend an activation email{" "}
						{buttonTimer == 0 ? "now." : `in ${buttonTimer} seconds...`}
					</span>
					<Button
						type="button"
						onClick={() => handleResend()}
						className="mt-2 bg-custom-green-1 hover:bg-custom-green-2"
						disabled={buttonTimer !== 0}
					>
						Resend Activation Email
					</Button>
				</div>
			</Card>
		</>
	);
}

export default ResendActivatioNCard;
