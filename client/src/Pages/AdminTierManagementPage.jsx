import axios from "axios";
import { Button, Card, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUsers } from "react-icons/fa";
import { GrStorage } from "react-icons/gr";
import { TbCapture } from "react-icons/tb";
import LoadingCard from "../Components/LoadingCard";
import { MdAddCircle, MdOutlineClose } from "react-icons/md";
import { IoPricetagsOutline, IoTrashOutline } from "react-icons/io5";
import DropdownDoubleSlider from "../Components/DropdownDoubleSlider";
import TierManagementTable from "../Components/Admin/TierManagementTable";
import ConfirmationModal from "../Components/ConfirmationModal";
import CreateTierModal from "../Components/Admin/CreateTierModal";

function AdminTierManagementPage() {
	const [tiers, setTiers] = useState([]);
	const [selected, setSelected] = useState(new Set());
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [isRemoveLoading, setIsRemoveLoading] = useState(false);
	const [failedList, setFailedList] = useState([]);
	const [messageModal, setMessageModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState({
		min_detection_limit: 0,
		max_detection_limit: 10,
		min_storage_size: 0,
		max_storage_size: 10,
		min_price: 0,
		max_price: 100,
		min_num_users: 0,
		max_num_users: 100,
	});
	const [upperLimits, setUpperLimits] = useState({
		detection_limit: 100,
		storage_size: 10,
		price: 100,
		num_users: 100,
	});

	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get("/api/admin/tier_management/query_all_tiers")
			.then((res) => {
				if (res.status === 200) {
					setTiers(res.data.tiers);
					const max_detection = res.data.tiers.reduce((acc, value) => {
						return (acc = acc > value.detection_quota_limit ? acc : value.detection_quota_limit);
					}, 10);
					const max_storage = res.data.tiers.reduce((acc, value) => {
						return (acc = acc > value.storage_limit / 1024 ? acc : value.storage_limit / 1024);
					}, 10);
					const max_price = res.data.tiers.reduce((acc, value) => {
						return (acc = acc > value.price ? acc : Math.ceil(value.price));
					}, 100);
					const max_num_users = res.data.tiers.reduce((acc, value) => {
						return (acc = acc > value.num_users ? acc : value.num_users);
					}, 100);
					// Update upper limits for f ilter
					setUpperLimits((prev) => ({
						...prev,
						detection_limit: max_detection,
						storage_size: max_storage,
						price: max_price,
						num_users: max_num_users,
					}));
					// Update Filter
					setFilter((prev) => ({
						...prev,
						max_detection_limit: max_detection,
						max_storage_size: max_storage,
						max_price: max_price,
						max_num_users: max_num_users,
					}));
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

	const handleDelete = () => {
		setIsRemoveLoading(true);
		selected.forEach((tier_name) => {
			axios
				.delete("/api/admin/tier_management/delete_tier", {
					data: {
						name: tier_name,
					},
				})
				.then((res) => {
					if (res.data.status_code !== 200) {
						setFailedList((prev) => [...prev, { name: tier_name, message: res.data.message }]);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		});
		if (failedList.length == selected.length) {
			alert("Failed to delete tiers, please try again...");
		} else {
			setShowRemoveModal(false);
			setMessageModal(true);
		}
		setIsRemoveLoading(false);
	};

	const searchFilter = () => {
		const filtered_list = [];
		tiers.forEach((tier) => {
			// Filtering
			const detection_bool = filter.min_detection_limit <= tier.detection_quota_limit && filter.max_detection_limit >= tier.detection_quota_limit;
			const storage_bool = filter.min_storage_size * 1024 <= tier.storage_limit && filter.max_storage_size * 1024 >= tier.storage_limit;
			const price_bool = filter.min_price <= tier.price && filter.max_price >= tier.price;
			const num_user_bool = filter.min_num_users <= tier.num_users && filter.max_num_users >= tier.num_users;

			// Search keyword
			const keyword = search.toLowerCase().trim();
			const search_bool = keyword_bool(keyword, tier.name);

			if (detection_bool && storage_bool && price_bool && num_user_bool && search_bool) {
				filtered_list.push(tier);
			}
		});
		return filtered_list;
	};

	const displayListOfSelectedTiers = () => {
		let list_of_tiers = [];
		selected.forEach((tier_name) => {
			list_of_tiers.push(
				<li className="text-gray-600 text-sm" key={tier_name}>
					{tier_name}
				</li>
			);
		});
		return <ul>{list_of_tiers}</ul>;
	};

	const displayMessageModal = () => {
		return (
			<Modal
				id="suspend-status"
				show={messageModal}
				onClose={() => {
					setMessageModal(false);
					window.location.reload();
				}}
				size="xl"
				popup
			>
				<Modal.Header />
				<Modal.Body>
					<div className="flex flex-col justify-between m-5">
						<h1 className="text-2xl text-center text-semibold">All selected tiers have been successfully removed </h1>
						{failedList.length > 0 && (
							<div className="mt-4 flex flex-col justify-start">
								<span className="text-xl text-start">Except:</span>
								<div className="mt-4 w-full max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
									<ul>
										{failedList.map((tier) => (
											<li className="text-gray-600 text-sm mb-1" key={tier.name}>
												<span className="font-semibold">{`${tier.name}:`}</span>
												<br />
												{tier.message}
											</li>
										))}
									</ul>
								</div>
							</div>
						)}
					</div>
				</Modal.Body>
			</Modal>
		);
	};

	return (
		<div className="min-h-screen">
			{/* Loading Cards */}
			<LoadingCard show={isLoading}>Loading Tier Plans...</LoadingCard>
			<LoadingCard show={isRemoveLoading}>Removing Selected Tiers...</LoadingCard>
			{/* Modals */}
			{displayMessageModal()}
			<ConfirmationModal state={showRemoveModal} setState={setShowRemoveModal} action={handleDelete}>
				<span className="w-5/6 mx-auto">Are you sure you want to delete these tiers?</span>
				<div className="mb-6 mx-auto my-4 w-5/6 max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
					{displayListOfSelectedTiers()}
				</div>
			</ConfirmationModal>
			<CreateTierModal state={showCreateModal} setState={setShowCreateModal} />
			{/* Page Card */}
			<Card className="my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Tier Management</h1>
				</header>
				{/* Selected & Create Section */}
				<section className={`flex flex-col md:flex-row items-start gap-4 ${selected.size == 0 ? "justify-end" : "justify-between"}`}>
					<div
						className={`${
							selected.size == 0 && "hidden"
						} flex flex-row gap-4 bg-custom-green-3 items-center rounded-lg drop-shadow-md outline-custom-green-1 w-fit h-fit px-6 py-3`}
					>
						<span className="flex flex-row justify-between items-center text-sm text-gray-500 font-medium">
							<MdOutlineClose size={26} className="mr-2 p-1 rounded-lg hover:bg-gray-200" onClick={() => setSelected(new Set())} />
							You have selected {selected.size} tier plan(s).
						</span>
						<Button color="failure" className="text-sm text-white font-medium shadow-md py-0" onClick={() => setShowRemoveModal(true)}>
							<div className="flex justify-center">
								<IoTrashOutline size={16} />
								<span className="ml-1 text-xs">Remove</span>
							</div>
						</Button>
					</div>
					<Button
						className="bg-custom-green-1 hover:bg-custom-green-2 ring-custom-green-1 hover:ring-custom-green-2 pl-3 pr-4 items-center shadow-md"
						onClick={() => setShowCreateModal(true)}
					>
						<div className="flex flex-row justify-center items-center ">
							<MdAddCircle size={16} />
							<span className="ml-2 font-bold text-center"> Create New Tier</span>
						</div>
					</Button>
				</section>
				{/* Filters Search */}
				<section className="flex flex-col xl:flex-row justify-between gap-4">
					<div className="flex flex-col md:flex-row justify-start gap-4">
						<div className="flex flex-col sm:flex-row gap-4">
							<DropdownDoubleSlider
								label={"Detection Quota"}
								dropdown_label={"Detection Quota Limit"}
								filter={filter}
								setFilter={setFilter}
								min_update_key="min_detection_limit"
								max_update_key="max_detection_limit"
								upper_limit={upperLimits.detection_limit}
								icon={<TbCapture size={20} className="text-gray-400" />}
							/>
							<DropdownDoubleSlider
								label={"Storage (GB)"}
								dropdown_label={"Storage Size Limit (GB)"}
								filter={filter}
								setFilter={setFilter}
								min_update_key="min_storage_size"
								max_update_key="max_storage_size"
								upper_limit={upperLimits.storage_size}
								icon={<GrStorage size={20} className="text-gray-400" />}
							/>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<DropdownDoubleSlider
								label={"Price (SGD)"}
								dropdown_label={"Tier Plan Price (SGD)"}
								filter={filter}
								setFilter={setFilter}
								min_update_key="min_price"
								max_update_key="max_price"
								upper_limit={upperLimits.price}
								icon={<IoPricetagsOutline size={20} className="text-gray-400" />}
							/>
							<DropdownDoubleSlider
								label={"User Count"}
								dropdown_label={"Number of Users Subscribed"}
								filter={filter}
								setFilter={setFilter}
								min_update_key="min_num_users"
								max_update_key="max_num_users"
								upper_limit={upperLimits.num_users}
								icon={<FaUsers size={20} className="text-gray-400" />}
							/>
						</div>
					</div>

					<div className="flex flex-col justify-end sm:w-1/2 sm:pr-2 xl:pr-0 xl:w-1/4 mt-2 sm:mt-0">
						<TextInput id="Search" placeholder="Search User Account" icon={FaSearch} onChange={(event) => setSearch(event.target.value)} />
					</div>
				</section>
				<section>
					<TierManagementTable tiers={searchFilter()} selected={selected} setSelected={setSelected} />
				</section>
			</Card>
		</div>
	);
}

export default AdminTierManagementPage;
