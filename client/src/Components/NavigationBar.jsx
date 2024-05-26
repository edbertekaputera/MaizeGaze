import {
	Avatar,
	Drawer,
	Dropdown,
	Navbar,
	Sidebar,
	TextInput,
} from "flowbite-react";
import { RiMenu2Fill } from "react-icons/ri";
import { GiCorn } from "react-icons/gi";
import { MdLogout, MdSpaceDashboard } from "react-icons/md";
import { LuUserCircle2 } from "react-icons/lu";

import logo from "../assets/full_logo.png";
import { useContext, useState } from "react";
import { AuthContext } from "./Authentication/PrivateRoute";
import ConfirmationModal from "./ConfirmationModal";

export default function NavigationBar() {
	const { userInfo, logout } = useContext(AuthContext);
	const [showDrawer, setShowDrawer] = useState(false);
	const [showConfirmLogoutModal, setShowConfirmLogoutModal] = useState(false);

	const drawerRoutes = {
		ADMINISTRATOR: [],
		FREE_USER: [
			{ icon: MdSpaceDashboard, link: "/user", name: "Dashboard" },
			{ icon: GiCorn, link: "/user/detect", name: "Detect and Count" },
		],
	};

	return (
		<>
			{/* Logout Confirmation Modal */}
			<ConfirmationModal
				state={showConfirmLogoutModal}
				setState={setShowConfirmLogoutModal}
				action={logout}
				icon={<MdLogout size={64} />}
			>
				Are you sure you want to log out?
			</ConfirmationModal>
			{/* Navbar */}
			<Navbar fluid rounded className="relative bg-custom-green-3 shadow z-10">
				<RiMenu2Fill
					size={40}
					className="ml-2 hover:bg-gray-200 p-1 rounded-lg"
					onClick={() => setShowDrawer(true)}
				/>
				<Navbar.Brand>
					<img src={logo} width={180} />
				</Navbar.Brand>
				<div className="flex md:order-2">
					<Dropdown arrowIcon={false} inline label={<LuUserCircle2 size={48} className="mr-2 hover:bg-gray-200 p-1 rounded-lg"/>}>
						<Dropdown.Header>
							<span className="block text-sm">{userInfo.name}</span>
							<span className="block truncate text-sm font-medium">
								{userInfo.email}
							</span>
							<span className="block truncate text-xs text-gray-400">
								({userInfo.type})
							</span>
						</Dropdown.Header>
						<Dropdown.Item
							onClick={() => setShowConfirmLogoutModal(true)}
							icon={MdLogout}
						>
							Logout
						</Dropdown.Item>
					</Dropdown>
				</div>
			</Navbar>
			{/* Drawer */}
			<Drawer open={showDrawer} onClose={() => setShowDrawer(false)}>
				<Drawer.Header title="MENU" titleIcon={() => <></>} />
				<Drawer.Items>
					<Sidebar
						aria-label="Sidebar with multi-level dropdown example"
						className="[&>div]:bg-transparent [&>div]:p-0"
					>
						<div className="flex h-full flex-col justify-between py-2">
							<div>
								<Sidebar.Items>
									<Sidebar.ItemGroup>
										{drawerRoutes[userInfo.type].map((item) => (
											<Sidebar.Item
												key={item.name}
												href={item.link}
												icon={item.icon}
											>
												{item.name}
											</Sidebar.Item>
										))}
									</Sidebar.ItemGroup>
									<Sidebar.ItemGroup>
										<Sidebar.Item
											onClick={() => setShowConfirmLogoutModal(true)}
											icon={MdLogout}
										>
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
