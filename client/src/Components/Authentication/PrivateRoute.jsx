// Libraries
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { Footer, Spinner } from "flowbite-react";
import ResendActivatioNCard from "../Login/ResendActivationCard";
import NavigationBar from "../NavigationBar";
import logo from "../../assets/logo.png";
import SuspendedCard from "../Login/SuspendedCard";

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
		suspended: false,
		has_password: false,
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
						suspended: res.data.data.suspended,
						has_password: res.data.data.has_password,
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

	if (userInfo.type == "anonymous") {
		// Not authenticated
		return <Navigate to="/login" />;
	} else if (userInfo.suspended) {
		// Suspended
		return (
			<AuthContext.Provider value={{ userInfo, logout }}>
				<NavigationBar />
				<div className="flex justify-center items-center h-screen">
					<SuspendedCard />
				</div>
			</AuthContext.Provider>
		);
	} else if (checkPermission()) {
		// Valid permissions
		if (!userInfo.activated) {
			// Not activated
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
			// Valid permissions with activated email
			<AuthContext.Provider value={{ userInfo, logout }}>
				<div className="flex flex-col">
					<NavigationBar />
					{children}
					<Footer container className="flex flex-row justify-between items-center bg-custom-brown-3 rounded-none gap-2">
						{/* <Footer.Brand href="#" src={logo} alt="Flowbite Logo" /> */}
						<img src={logo} alt="Flowbite Logo" width={32} />
						<Footer.Copyright className="text-lg font-bold text-custom-brown-1" by="MaizeGaze" year={2024} />
					</Footer>
				</div>
			</AuthContext.Provider>
		);
	} else if (userInfo.is_admin) {
		// Go to admin  home
		return <Navigate to="/administrator/user_management" />;
	} else {
		// Go to user home
		return <Navigate to="/user" />;
	}
};

export default PrivateRoute;
