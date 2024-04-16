import React, { useContext, useState } from "react";
import { Card, Label, Button } from "flowbite-react";
import axios from "axios";
import { AuthContext } from "../Authentication/PrivateRoute";

function ResendActivatioNCard() {
	const [buttonDisabled, setButtonDisabled] = useState(false);
	const [buttonTimer, setButtonTimer] = useState(30);
	const userInfo = useContext(AuthContext);

	const handleResend = async () => {
		setButtonDisabled(true);
		await axios
			.post("/api/authentication/resend_activation_email")
			.catch((error) => {
				console.log(error);
			});

		var myInterval = setInterval(() => {
			return setButtonTimer((prev) => prev - 1);
		}, 1000);

		setTimeout(() => {
			setButtonDisabled(false);
			setButtonTimer(30);
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
		<Card>
			<div className="flex flex-col gap-3">
				<Label
					className="text-xl mb-2 text-center"
					value="Please Activate your Account"
				/>
				<p>
					To activate your account, you need to verify your email address.{" "}
					<br />
					We have sent you an activation email to your email address{" "}
					{encryptedEmail()}
				</p>
				<span>
					You can resend an activation email in {buttonTimer} seconds...
				</span>
				<Button
					type="button"
					onClick={() => handleResend()}
					className="mt-2"
					disabled={buttonDisabled}
				>
					Resend Activation Email
				</Button>
			</div>
		</Card>
	);
}

export default ResendActivatioNCard;
