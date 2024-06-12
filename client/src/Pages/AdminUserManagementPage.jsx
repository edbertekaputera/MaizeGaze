import axios from "axios";
import { Button, Card, Dropdown, Label, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DropdownCheckbox from "../Components/DropdownCheckbox";
import { FaSearch } from "react-icons/fa";
import { GrStatusInfo } from "react-icons/gr";
import { TbPremiumRights } from "react-icons/tb";
import UserManagementTable from "../Components/Admin/UserManagementTable";
import LoadingCard from "../Components/LoadingCard";
import { MdBlock, MdDelete, MdFileDownload, MdOutlineClose } from "react-icons/md";
import SuspendUserModal from "../Components/Admin/SuspendUserModal";

function AdminUserManagementPage() {
	const [users, setUsers] = useState([]);
	const [selected, setSelected] = useState(new Set());
	const [showSuspendModal, setShowSuspendModal] = useState(false);
	const [isSuspendLoading, setIsSuspendLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState({
		tier: {},
		status: {
			Unverified: true,
			Active: true,
			Suspended: true,
		},
	});

	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get("/api/admin/tier_management/query_all_tiers")
			.then((res) => {
				if (res.status === 200) {
					res.data.tiers.forEach((tier) => {
						setFilter((prev) => ({
							...prev,
							tier: {
								...prev.tier,
								[tier.name]: true,
							},
						}));
					});
				} else {
					console.log(res.status);
					alert("Something went wrong!");
					navigate("/administrator");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
				navigate("/administrator");
			});

		axios
			.get("/api/admin/user_management/search_users")
			.then((res) => {
				if (res.status === 200) {
					setUsers(res.data.result);
				} else {
					console.log(res.status);
					alert("Something went wrong! Please Reload the page.");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong! Please Reload the page.");
			})
			.then(() => setIsLoading(false));
	}, []);

	const keyword_bool = (keyword, value) => {
		const splitted_val = value.split(" ");
		let flag = false;
		splitted_val.forEach((val) => {
			if (val.toLowerCase().trim().startsWith(keyword)) {
				flag = true;
				return;
			}
		});
		if (value.toLowerCase().trim().startsWith(keyword)) {
			return true;
		}

		return flag;
	};

	const searchFilter = () => {
		const filtered_list = [];
		users.forEach((user) => {
			// Tier Filter
			const tier_bool = filter.tier[user.user_type];
			// Status Filter
			let status = "Unverified";
			if (user.email_is_verified) {
				if (user.suspended) {
					status = "Suspended";
				} else {
					status = "Active";
				}
			}
			const status_bool = filter.status[status];
			// Search keyword
			const keyword = search.toLowerCase().trim();
			const search_bool = keyword_bool(keyword, user.name) || keyword_bool(keyword, user.email);

			if (tier_bool && status_bool && search_bool) {
				filtered_list.push(user);
			}
		});
		return filtered_list;
	};

	console.log(users);
	return (
		<div className="min-h-screen">
			{/* Loading Cards */}
			<LoadingCard show={isLoading}>Loading User Accounts...</LoadingCard>
			<LoadingCard show={isSuspendLoading}>Suspending Selected Users...</LoadingCard>
			{/* Modals */}
			<SuspendUserModal state={showSuspendModal} setState={setShowSuspendModal} selected={selected}/>
			{/* Page Card */}
			<Card className="my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">User Management</h1>
				</header>
				{/* Selected Popup */}
				<section
					className={`${
						selected.size == 0 && "hidden"
					} flex flex-row gap-4 bg-custom-green-3 items-center rounded-lg drop-shadow-md outline-custom-green-1 w-fit h-fit px-6 py-3`}
				>
					<span className="flex flex-row justify-between items-center text-sm text-gray-500 font-medium">
						<MdOutlineClose size={26} className="mr-2 p-1 rounded-lg hover:bg-gray-200" onClick={() => setSelected(new Set())} />
						You have selected {selected.size} user account(s).
					</span>
					<Button color="failure" className="text-sm text-white font-medium shadow-md py-0" onClick={() => setShowSuspendModal(true)}>
						<MdBlock size={16} />
						<span className="ml-1 text-xs">Suspend</span>
					</Button>
				</section>
				{/* Filters Search */}
				<section className="flex flex-col sm:flex-row justify-between gap-4">
					<div className="flex flex-col sm:flex-row justify-start gap-4">
						<DropdownCheckbox
							filter={filter}
							setFilter={setFilter}
							label="Tier"
							update_key="tier"
							icon={<TbPremiumRights size={20} className="text-gray-400" />}
						/>
						<DropdownCheckbox
							filter={filter}
							setFilter={setFilter}
							label="Status"
							update_key="status"
							icon={<GrStatusInfo size={20} className="text-gray-400" />}
						/>
					</div>
					<div className="flex flex-col justify-end sm:w-1/2 sm:pr-2 xl:pr-0 xl:w-1/4 mt-2 sm:mt-0">
						<TextInput id="Search" placeholder="Search User Account" icon={FaSearch} onChange={(event) => setSearch(event.target.value)} />
					</div>
				</section>
				<section>
					<UserManagementTable results={searchFilter()} selected={selected} setSelected={setSelected} />
				</section>
			</Card>
		</div>
	);
}

export default AdminUserManagementPage;
