// Libraries
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { Spinner } from "flowbite-react";
import ResendActivatioNCard from "../Login/ResendActivationCard";
import NavigationBar from "../NavigationBar";

// Context for authentication
export const AuthContext = createContext();

// Private Route Wrapper
const PrivateRoute = ({ admin_only = false, user_only = false, children }) => {
	const [userInfo, setuserInfo] = useState({
		email: "",
		name: "",
		type: "",
		activated: false,
		is_admin: false,
		detection_quota_limit: 0,
		storage_limit: 0,
	});

	const navigate = useNavigate();

	const checkPermission = () => {
		const admin_only_bool = !admin_only || userInfo.is_admin;
		const user_only_bool = !user_only || !userInfo.is_admin;

		return admin_only_bool && user_only_bool;
	};

	useEffect(() => {
		axios
			.get("/api/authentication/whoami")
			.then((res) => {
				if (res.data.status_code === 200) {
					setuserInfo((prev) => ({
						...prev,
						email: res.data.data.email,
						name: res.data.data.name,
						type: res.data.data.type,
						activated: res.data.data.activated,
						is_admin: res.data.data.is_admin,
						detection_quota_limit: res.data.data.detection_quota_limit,
						storage_limit: res.data.data.storage_limit,
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
	}, [admin_only, user_only]);

	const logout = async () => {
		await axios
			.post("/api/authentication/logout")
			.then((res) => {
				if (res.data.status_code === 200) {
					navigate("/");
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	if (userInfo.type == "") {
		return (
			<div className="text-center text-8xl">
				<Spinner aria-label="Extra large spinner example" size="xl" />
			</div>
		);
	}

	if (checkPermission()) {
		if (!userInfo.activated) {
			return (
				<AuthContext.Provider value={{ userInfo, logout }}>
					<NavigationBar />
					<div className="flex justify-center items-center h-screen">
						<ResendActivatioNCard />
					</div>
				</AuthContext.Provider>
			);
		}
		return (
			<AuthContext.Provider value={{ userInfo, logout }}>
				<NavigationBar />
				{children}
			</AuthContext.Provider>
		);
	} else if (userInfo.type == "anonymous") {
		return <Navigate to="/login" />;
	} else if (userInfo.is_admin) {
		return <Navigate to="/administrator" />;
	} else {
		return <Navigate to="/user" />;
	}
};

export default PrivateRoute;
