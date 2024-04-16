// Libraries
import { Navigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { Spinner } from "flowbite-react";
import ResendActivatioNCard from "../Login/ResendActivationCard";

// Context for authentication
export const AuthContext = createContext();

// Private Route Wrapper
const PrivateRoute = ({ requiredRoles, children }) => {
	const [userInfo, setuserInfo] = useState({
		email: "",
		name: "",
		type: "",
		activated: false,
	});

	useEffect(() => {
		axios
			.post("/api/authentication/whoami")
			.then((res) => {
				if (res.data.status_code === 200) {
					setuserInfo((prev) => ({
						...prev,
						email: res.data.data.email,
						name: res.data.data.name,
						type: res.data.data.type,
						activated: res.data.data.activated,
					}));
				} else {
					console.log(`${res.data.status_code}: ${res.data.message}`);
					setuserInfo((prev) => ({
						...prev,
						type: "anonymous",
					}));
				}
			})
			.catch((error) => {
				console.log(error);
				setuserInfo((prev) => ({
					...prev,
					type: "anonymous",
				}));
			});
	}, [requiredRoles]);

	if (userInfo.type == "") {
		return (
			<div className="text-center text-8xl">
				<Spinner aria-label="Extra large spinner example" size="xl" />
			</div>
		);
	}

	if (requiredRoles.includes(userInfo.type)) {
		if (!userInfo.activated) {
			return (
				<AuthContext.Provider value={userInfo}>
					<div className="flex justify-center items-center h-screen">
						<ResendActivatioNCard />
					</div>
				</AuthContext.Provider>
			);
		}
		return (
			<AuthContext.Provider value={userInfo}>
				{children}
			</AuthContext.Provider>
		);
	} else if (
		["FREE_USER", "STANDARD_USER", "PREMIUM_USER"].includes(userInfo.type)
	) {
		return <Navigate to="/user" />;
	} else if (userInfo.type === "ADMINISTRATOR") {
		return <Navigate to="/administrator" />;
	} else {
		return <Navigate to="/login" />;
	}
};

export default PrivateRoute;
