import { Avatar, Drawer, Dropdown, Navbar, Sidebar, TextInput } from "flowbite-react";
import { RiMenu2Fill } from "react-icons/ri";
import { GiArtificialHive, GiArtificialIntelligence, GiCorn } from "react-icons/gi";
import { MdLogout, MdSpaceDashboard, MdOutlineWorkHistory, MdManageAccounts, MdSettings } from "react-icons/md";
import { GoSponsorTiers } from "react-icons/go";
import { CgBrowse } from "react-icons/cg";
import { Star } from 'lucide-react';
import { VscFeedback } from "react-icons/vsc";

import { LuUserCircle2 } from "react-icons/lu";

import logo from "../assets/full_logo.png";
import { useContext, useState } from "react";
import { AuthContext } from "./Authentication/PrivateRoute";
import ConfirmationModal from "./ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { FaPersonCircleQuestion, FaUserDoctor } from "react-icons/fa6";
import { PiFarmFill } from "react-icons/pi";

export default function NavigationBar() {
	const { userInfo, logout } = useContext(AuthContext);
	const [showDrawer, setShowDrawer] = useState(false);
	const [showConfirmLogoutModal, setShowConfirmLogoutModal] = useState(false);
	const navigate = useNavigate();

	const drawerRoutes = {
		ADMINISTRATOR: [
			// { icon: MdSpaceDashboard, link: "/administrator", name: "Dashboard" },
			{ icon: MdManageAccounts, link: "/administrator/user_management", name: "User Management" },
			{ icon: GoSponsorTiers, link: "/administrator/tier_management", name: "Tier Management" },
			{ icon: VscFeedback, link: "/administrator/feedback_management", name: "Feedback Management" },
		],
		USER: [
			{ icon: MdSpaceDashboard, link: "/user", name: "Dashboard" },
			{ icon: GiCorn, link: "/user/detect", name: "Detect and Count" },
			{ icon: MdOutlineWorkHistory, link: "/user/result_history", name: "Result History" },
		],
	};

	if (userInfo.can_diagnose) {
		drawerRoutes.USER.push({ icon: FaUserDoctor, link: "/user/maize_doctor", name: "Maize Doctor" });
	}
	if (userInfo.can_chatbot) {
		drawerRoutes.USER.push({ icon: FaPersonCircleQuestion, link: "/user/consultation", name: "Consultation" });
	}
	if (userInfo.can_active_learn) {
		drawerRoutes.USER.push({ icon: GiArtificialIntelligence, link: "/user/active_learn", name: "Active Learning" });
	}

	return (
		<>
			{/* Logout Confirmation Modal */}
			<ConfirmationModal state={showConfirmLogoutModal} setState={setShowConfirmLogoutModal} action={logout} icon={<MdLogout size={64} />}>
				Are you sure you want to log out?
			</ConfirmationModal>
			{/* Navbar */}
			<Navbar fluid rounded className="relative bg-custom-green-3 shadow z-10">
				<RiMenu2Fill size={40} className="ml-2 hover:bg-gray-200 p-1 rounded-lg" onClick={() => setShowDrawer(true)} />
				<Navbar.Brand>
					<img src={logo} width={180} />
				</Navbar.Brand>
				<div className="flex md:order-2">
					<Dropdown arrowIcon={false} inline label={<LuUserCircle2 size={48} className="mr-2 hover:bg-gray-200 p-1 rounded-lg" />}>
						<Dropdown.Header>
							<span className="block text-sm">{userInfo.name}</span>
							<span className="block truncate text-sm font-medium">{userInfo.email}</span>
							<span className="block truncate text-xs text-gray-400">({userInfo.type})</span>
						</Dropdown.Header>

						{!userInfo.is_admin && (
							<>
								<Dropdown.Item onClick={() => navigate("/user/plan_management")} icon={CgBrowse}>
									Plan Management
								</Dropdown.Item>
								<Dropdown.Item onClick={() => navigate("/user/farm_management")} icon={PiFarmFill}>
									Farm Management
								</Dropdown.Item>
								{userInfo.can_active_learn && (
									<Dropdown.Item onClick={() => navigate("/user/model_management")} icon={GiArtificialHive}>
										Model Management
									</Dropdown.Item>
								)}
								<Dropdown.Item onClick={() => navigate("/user/profile")} icon={MdSettings}>
									User Profile
								</Dropdown.Item>
								<Dropdown.Item onClick={() => navigate("/user/report_feedback")} icon={Star}>
									Report Feedback
								</Dropdown.Item>
							</>
						)}

						<Dropdown.Divider />
						<Dropdown.Item onClick={() => setShowConfirmLogoutModal(true)} icon={MdLogout}>
							Logout
						</Dropdown.Item>
					</Dropdown>
				</div>
			</Navbar>
			{/* Drawer */}
			<Drawer open={showDrawer} onClose={() => setShowDrawer(false)}>
				<Drawer.Header title="MENU" titleIcon={() => <></>} />
				<Drawer.Items>
					<Sidebar aria-label="Sidebar with multi-level dropdown example" className="[&>div]:bg-transparent [&>div]:p-0">
						<div className="flex h-full flex-col justify-between py-2">
							<div>
								<Sidebar.Items>
									<Sidebar.ItemGroup>
										{drawerRoutes[userInfo.is_admin ? "ADMINISTRATOR" : "USER"].map((item) => (
											<Sidebar.Item key={item.name} onClick={() => navigate(item.link)} icon={item.icon}>
												{item.name}
											</Sidebar.Item>
										))}
									</Sidebar.ItemGroup>
									{!userInfo.is_admin && (
										<Sidebar.ItemGroup>
											<Sidebar.Item onClick={() => navigate("/user/plan_management")} icon={CgBrowse}>
												Plan Management
											</Sidebar.Item>
											<Sidebar.Item onClick={() => navigate("/user/farm_management")} icon={PiFarmFill}>
												Farm Management
											</Sidebar.Item>
											{userInfo.can_active_learn && (
												<Sidebar.Item onClick={() => navigate("/user/model_management")} icon={GiArtificialHive}>
													Model Management
												</Sidebar.Item>
											)}
											<Sidebar.Item onClick={() => navigate("/user/profile")} icon={MdSettings}>
												User Profile
											</Sidebar.Item>
											<Sidebar.Item onClick={() => navigate("/user/report_feedback")} icon={Star}>
												Report Feedback
											</Sidebar.Item>
										</Sidebar.ItemGroup>
									)}
									<Sidebar.ItemGroup>
										<Sidebar.Item onClick={() => setShowConfirmLogoutModal(true)} icon={MdLogout}>
											Logout
										</Sidebar.Item>
									</Sidebar.ItemGroup>
								</Sidebar.Items>
							</div>
						</div>
					</Sidebar>
				</Drawer.Items>
			</Drawer>
		</>
	);
}
