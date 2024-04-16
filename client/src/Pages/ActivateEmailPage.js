import React, { useEffect } from "react";
import { Spinner } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ActivateEmailPage() {
	const navigate = useNavigate();
	const params = useParams();

	useEffect(() => {
		axios
			.post("/api/authentication/activate_email", {
				token: params.token,
			})
			.catch((error) => {
				console.log(error);
			})
			.then((res) => {
				if (res.data.status_code === 200) {
					navigate("/");
				} else {
					alert(res.data.message);
					navigate("/");
				}
			})
	}, []);

	return (
		<div className="text-center text-8xl">
			<Spinner aria-label="Extra large spinner example" size="xl" />
		</div>
	);
}

export default ActivateEmailPage;
