// Libraries
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Spinner } from "flowbite-react";

// Private Route Wrapper
const UnAuthenticatedRoute = ({ children }) => {
	const [authType, setAuthType] = useState();

	useEffect(() => {
		axios
			.post("/api/authentication/whoami")
			.then((res) => {
				if (res.data.status_code === 200) {
					setAuthType(res.data.data.type);
				} else {
					console.log(`${res.data.status_code}: ${res.data.message}`);
					setAuthType("anonymous");
				}
			})
			.catch((error) => {
				console.log(error);
				setAuthType("anonymous");
			});
	}, []);

	if (!authType) {
		return (
			<div className="text-center text-8xl">
				<Spinner aria-label="Extra large spinner example" size="xl" />
			</div>
		);
	}

	if (["FREE_USER", "STANDARD_USER", "PREMIUM_USER"].includes(authType)) {
		return <Navigate to="/user" />;
	} else if (authType === "ADMINISTRATOR") {
		return <Navigate to="/administrator" />;
	} else {
		return children;
	}
};

export default UnAuthenticatedRoute;
