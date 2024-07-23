import axios from "axios";
import { Button, Card, Checkbox, Dropdown, Label, Modal, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../Components/ConfirmationModal";
import LoadingCard from "../Components/LoadingCard";
import { MdAddCircle, MdOutlineClose } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { FaCity, FaSearch } from "react-icons/fa";
import DropdownDoubleSlider from "../Components/DropdownDoubleSlider";
import { BiArea } from "react-icons/bi";
import { FaEarthAsia } from "react-icons/fa6";
import { BsArrowDownShort } from "react-icons/bs";
import FarmManagementTable from "../Components/Farm/FarmManagementTable";

function FarmManagementPage() {
	const [cities, setCities] = useState({});
	const [farms, setFarms] = useState([]);
	const [selected, setSelected] = useState(new Set());
	const [landSize, setLandSize] = useState({
		min: 0,
		max: 1000,
		upper_limit: 1000,
	});
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [isRemoveLoading, setIsRemoveLoading] = useState(false);
	const [failedList, setFailedList] = useState([]);
	const [messageModal, setMessageModal] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		// Get all countries
		axios
			.get("/api/user/farm/query_all_country_city")
			.then((res) => {
				if (res.status === 200) {
					Object.keys(res.data.countries).forEach((country) => {
						res.data.countries[country].forEach((city) => {
							setCities((prev) => ({
								...prev,
								[country]: {
									...prev[country],
									[city]: true,
								},
							}));
						});
					});
				} else {
					console.log(res.status);
					alert("Something went wrong!");
					navigate("/user");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
				navigate("/user");
			});

		// Get All farms
		axios
			.get("/api/user/farm/query_all_farms_owned")
			.then((res) => {
				if (res.status === 200) {
					setFarms(res.data.farms);
					const max_land_size = res.data.farms.reduce((acc, value) => {
						return (acc = acc > Math.ceil(value.total_land_size) ? acc : Math.ceil(value.total_land_size));
					}, 100);
					// Update Land Size Filter
					setLandSize((prev) => ({
						...prev,
						max: max_land_size,
						upper_limit: max_land_size,
					}));
				} else {
					console.log(res.status);
					alert("Something went wrong!");
					navigate("/user");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
				navigate("/user");
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
		selected.forEach((farm_name) => {
			axios
				.delete("/api/user/farm/delete_farm", {
					data: {
						name: farm_name,
					},
				})
				.then((res) => {
					if (res.data.status_code !== 200) {
						setFailedList((prev) => [...prev, { name: farm_name, message: res.data.message }]);
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

	const check_all_city_bool = (bool_val) => {
		return Object.keys(cities).every((country) => Object.values(cities[country]).every((city_val) => city_val === bool_val));
	};

	const check_some_city_in_country_bool = (country, bool_val) => {
		return Object.values(cities[country]).some((city_val) => city_val === bool_val);
	};

	const searchFilter = () => {
		const filtered_list = [];
		farms.forEach((farm) => {
			// Filtering
			const land_size_bool = landSize.min <= farm.total_land_size && landSize.max >= farm.total_land_size;
			const country_bool = check_some_city_in_country_bool(farm.country, true);
			const city_bool = cities[farm.country][farm.city];

			// Search keyword
			const keyword = search.toLowerCase().trim();
			const search_bool =
				keyword_bool(keyword, farm.name) || keyword_bool(keyword, farm.address) || keyword_bool(keyword, farm.country) || keyword_bool(keyword, farm.city);

			if (land_size_bool && country_bool && city_bool && search_bool) {
				filtered_list.push(farm);
			}
		});
		return filtered_list;
	};

	const displayListOfSelectedFarms = () => {
		let list_of_farms = [];
		selected.forEach((farm_name) => {
			list_of_farms.push(
				<li className="text-gray-600 text-sm" key={farm_name}>
					{farm_name}
				</li>
			);
		});
		return <ul>{list_of_farms}</ul>;
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
						<h1 className="text-2xl text-center text-semibold">All selected farms have been successfully removed </h1>
						{failedList.length > 0 && (
							<div className="mt-4 flex flex-col justify-start">
								<span className="text-xl text-start">Except:</span>
								<div className="mt-4 w-full max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
									<ul>
										{failedList.map((farm) => (
											<li className="text-gray-600 text-sm mb-1" key={farm.name}>
												<span className="font-semibold">{`${farm.name}:`}</span>
												<br />
												{farm.message}
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
			{/* Modals */}
			{displayMessageModal()}
			<ConfirmationModal state={showRemoveModal} setState={setShowRemoveModal} action={handleDelete}>
				{isRemoveLoading ? (
					<div className="flex flex-col justify-center mb-2 items-center">
						<h3 className="mb-5 text-xl font-normal text-gray-600">Removing Farm...</h3>
						<Spinner size={"xl"} color={"success"} />
					</div>
				) : (
					<>
						<span className="w-5/6 mx-auto">Are you sure you want to delete these farms?</span>
						<div className="mb-6 mx-auto my-4 w-5/6 max-h-28 overflow-auto px-4 py-2 outline-1 outline-gray-400 outline rounded-lg shadow-lg drop-shadow-sm text-2xl font-medium text-gray-900 ">
							{displayListOfSelectedFarms()}
						</div>
					</>
				)}
			</ConfirmationModal>
			{/* Insert Create Farm Modal */}

			{/* Page Card */}
			<Card className="my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				{/* Header */}
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Farm Management</h1>
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
							You have selected {selected.size} farms(s).
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
							<span className="ml-2 font-bold text-center"> Create New Farm</span>
						</div>
					</Button>
				</section>

				{/* Filters Search */}
				<section className="flex flex-col xl:flex-row justify-between gap-4">
					<div className="flex flex-col md:flex-row justify-start gap-4">
						{/* Country Dropdown */}
						<div className="flex flex-col w-full sm:w-1/2 md:w-fit">
							<Label className="mb-1 text-sm font-semibold">Country:</Label>
							<Dropdown
								label="Dropdown button"
								className="drop-shadow-md "
								renderTrigger={() => (
									<div className="w-full flex p-2.5 pl-3 flex-row gap-2 justify-between items-center align-middle bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg hover:ring-custom-green-1 hover:border-custom-green-1">
										<div className="flex flex-row gap-2">
											<FaEarthAsia size={20} className="text-gray-400" />
											Country
										</div>
										<BsArrowDownShort size={20} />
									</div>
								)}
							>
								<div className="flex flex-row gap-2 my-2 mx-2 items-center w-full">
									<Checkbox
										checked={Object.keys(cities).every((country) => check_some_city_in_country_bool(country, true))}
										onChange={() => {
											const allChecked = Object.keys(cities).every((country) => check_some_city_in_country_bool(country, true));
											Object.keys(cities).forEach((country) => {
												Object.keys(cities[country]).forEach((city) => {
													setCities((prev) => ({
														...prev,
														[country]: {
															...prev[country],
															[city]: !allChecked,
														},
													}));
												});
											});
										}}
									/>
									<Label htmlFor="buyer" className="grow">
										All
									</Label>
								</div>
								{Object.keys(cities).map((country) => (
									<div key={country} className="flex flex-row flex-grow gap-2 my-2 mx-2 items-center w-full">
										<Checkbox
											id={country}
											checked={check_some_city_in_country_bool(country, true)}
											onChange={() => {
												const some_checked = check_some_city_in_country_bool(country, true);
												Object.keys(cities[country]).forEach((city) => {
													setCities((prev) => ({
														...prev,
														[country]: {
															...prev[country],
															[city]: !some_checked,
														},
													}));
												});
											}}
										/>
										<Label htmlFor="buyer" className="grow">
											{country}
										</Label>
									</div>
								))}
							</Dropdown>
						</div>
						{/* City Dropdown */}
						<div className="flex flex-col w-full sm:w-1/2 md:w-fit">
							<Label className="mb-1 text-sm font-semibold">City:</Label>
							<Dropdown
								label="Dropdown button"
								className="drop-shadow-md "
								renderTrigger={() => (
									<div className="w-full flex p-2.5 pl-3 flex-row gap-2 justify-between items-center align-middle bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg hover:ring-custom-green-1 hover:border-custom-green-1">
										<div className="flex flex-row gap-2">
											<FaCity size={20} className="text-gray-400" />
											City
										</div>
										<BsArrowDownShort size={20} />
									</div>
								)}
							>
								<div className="flex flex-row gap-2 my-2 mx-2 items-center w-full">
									<Checkbox
										checked={check_all_city_bool(true)}
										onChange={() => {
											const allChecked = check_all_city_bool(true);
											Object.keys(cities).forEach((country) => {
												Object.keys(cities[country]).forEach((city) => {
													setCities((prev) => ({
														...prev,
														[country]: {
															...prev[country],
															[city]: !allChecked,
														},
													}));
												});
											});
										}}
									/>
									<Label htmlFor="buyer" className="grow">
										All
									</Label>
								</div>
								{Object.keys(cities).map((country) => {
									return Object.keys(cities[country]).map((city_key) => (
										<div key={city_key} className="flex flex-row flex-grow gap-2 my-2 mx-2 items-center w-full">
											<Checkbox
												checked={cities[country][city_key]}
												onChange={() => {
													setCities((prev) => ({
														...prev,
														[country]: {
															...prev[country],
															[city_key]: !cities[country][city_key],
														},
													}));
												}}
											/>
											<Label htmlFor="buyer" className="grow">
												{`${country}, ${city_key}`}
											</Label>
										</div>
									));
								})}
							</Dropdown>
						</div>
						<DropdownDoubleSlider
							label={"Total Land Size"}
							dropdown_label={"Total Land Size (mu)"}
							filter={landSize}
							setFilter={setLandSize}
							min_update_key="min"
							max_update_key="max"
							upper_limit={landSize.upper_limit}
							icon={<BiArea size={20} className="text-gray-400" />}
						/>
					</div>

					<div className="flex flex-col justify-end sm:w-1/2 sm:pr-2 xl:pr-0 xl:w-1/4 mt-2 sm:mt-0">
						<TextInput id="Search" placeholder="Search Farm" icon={FaSearch} onChange={(event) => setSearch(event.target.value)} />
					</div>
				</section>
				<section>
					<FarmManagementTable farms={searchFilter()} selected={selected} setSelected={setSelected} />
				</section>
			</Card>
		</div>
	);
}

export default FarmManagementPage;
