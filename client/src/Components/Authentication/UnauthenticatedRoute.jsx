// Libraries
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Spinner } from "flowbite-react";

// Private Route Wrapper
const UnAuthenticatedRoute = ({ children }) => {
	const [authType, setAuthType] = useState({
		type: "",
		is_admin: false,
	});

	useEffect(() => {
		axios
			.get("/api/authentication/whoami")
			.then((res) => {
				if (res.data.status_code === 200) {
					setAuthType((prev) => ({
						...prev,
						type: res.data.data.type,
						is_admin: res.data.data.is_admin,
					}));
				} else {
					console.log(`${res.data.status_code}: ${res.data.message}`);
					setAuthType((prev) => ({
						...prev,
						type: "anonymous",
					}));
				}
			})
			.catch((error) => {
				console.log(error);
				setAuthType((prev) => ({
					...prev,
					type: "anonymous",
				}));
			});
	}, []);

	if (authType.type == "") {
		return (
			<div className="text-center text-8xl">
				<Spinner aria-label="Extra large spinner example" size="xl" />
			</div>
		);
	}

	if (authType.type == "anonymous") {
		return <div className="flex flex-col 2xl:h-screen"> {children}</div>;
	} else if (authType.is_admin) {
		return <Navigate to="/administrator" />;
	} else {
		return <Navigate to="/user" />;
	}
};

export default UnAuthenticatedRoute;
