import React, { useContext, useEffect, useMemo, useState } from "react";
import SearchNodel from "../Components/SearchModel";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingCard from "../Components/LoadingCard";
import ConfirmationModal from "../Components/ConfirmationModal";
import MessageModal from "../Components/MessageModal";
import { Button, Card, Progress, TextInput } from "flowbite-react";
import { MdAddCircle, MdDelete, MdOutlineClose } from "react-icons/md";
import { GrStatusInfo } from "react-icons/gr";
import DoubleDatePicker from "../Components/DoubleDatePicker";
import DropdownCheckbox from "../Components/DropdownCheckbox";
import { FaSearch } from "react-icons/fa";
import DropdownDoubleSlider from "../Components/DropdownDoubleSlider";
import { CgPerformance } from "react-icons/cg";
import ModelsTable from "../Components/Models/ModelsTable";
import { isAfter, isBefore, isSameDay } from "date-fns";

function ModelManagementPage() {
	const { userInfo } = useContext(AuthContext);
	const [usedStorageSize, setUsedStorageSize] = useState();
	const [models, setModels] = useState([]);
	const [selected, setSelected] = useState(new Set());
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showMessageModal, setShowMessageModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteLoading, setIsDeleteLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState({
		min_date: -1,
		max_date: new Date(),
		min_num_data: 0,
		max_num_data: 100,
		status: {},
	});
	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get("/api/storage/get_storage_size")
			.then((res) => {
				if (res.status === 200) {
					setUsedStorageSize(res.data.storage_size);
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

		axios
			.get("/api/detect/models/query_all_models")
			.then((res) => {
				if (res.status === 200) {
					setModels(res.data.models);
					const max_num_data = res.data.models.reduce((acc, value) => {
						return (acc = acc > value.num_data ? acc : value.num_data);
					}, 10);
					const statusObject = res.data.models.reduce((acc, obj) => {
						acc[obj.status] = true;
						return acc;
					}, {});
					setFilter((prev) => ({
						...prev,
						max_num_data: max_num_data,
						status: statusObject,
					}));
				} else {
					console.log(res.status);
					alert("Something went wrong! Please Reload the page.");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong! Please Reload the page.");
			})
			.then(() => {
				setIsLoading(false);
			});
	}, []);

	const max_num_data = useMemo(() => {
		return models.reduce((acc, value) => {
			return (acc = acc > value.num_data ? acc : value.num_data);
		}, 10);
	}, [models]);

	const handleDelete = () => {
		alert("Delete handled");
		// let data = { results_pk: [] };
		// selected.forEach((val) => {
		// 	const splitted_val = val.split("_");
		// 	data.results_pk.push({
		// 		id: splitted_val[2],
		// 		farm_name: splitted_val[0],
		// 		farm_patch_id: splitted_val[1],
		// 	});
		// });
		// setIsDeleteLoading(true);
		// axios
		// 	.delete("/api/storage/delete_results", { data: data })
		// 	.then((res) => {
		// 		if (res.data.success) {
		// 			setSelected(new Set());
		// 			setShowMessageModal(true);
		// 		} else {
		// 			console.log(res.status);
		// 			alert("Something went wrong!");
		// 		}
		// 	})
		// 	.catch((err) => {
		// 		console.log(err);
		// 		alert("Something went wrong!");
		// 	})
		// 	.then(() => setIsDeleteLoading(false));
	};

	const formatBytes = (bytes, decimals = 2) => {
		if (!+bytes) return "0 Bytes";
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

	const filterDateBool = (model) => {
		const splitted = model.training_date.split(" ");
		const splitted_date = splitted[0].split("-");
		const splitted_time = splitted[1].split(":");
		const date_obj = new Date(splitted_date[0], parseInt(splitted_date[1]) - 1, splitted_date[2], splitted_time[0], splitted_time[1], splitted_time[2]);
		const start_bool = filter.min_date == -1 || isSameDay(date_obj, filter.min_date) || isAfter(date_obj, filter.min_date);

		const end_bool = isSameDay(date_obj, filter.max_date) || isBefore(date_obj, filter.max_date);

		return start_bool && end_bool;
	};

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
		models.forEach((model) => {
			// Filtering
			const date_bool = filterDateBool(model);
			const num_data_bool = filter.min_num_data <= model.num_data && filter.max_num_data >= model.num_data;
			const status_bool = filter.status[model.status];

			// Search keyword
			const keyword = search.toLowerCase().trim();
			const search_bool = keyword_bool(keyword, model.name);

			if (date_bool && status_bool && num_data_bool && search_bool) {
				filtered_list.push(model);
			}
		});

		return filtered_list;
	};

	console.log(searchFilter());
	return (
		<div className="relative overflow-hidden min-h-screen">
			{/* Loading Cards */}
			<LoadingCard show={isLoading}>Loading Models...</LoadingCard>
			<LoadingCard show={isDeleteLoading}>Initiating Deletion...</LoadingCard>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal state={showDeleteModal} setState={setShowDeleteModal} action={handleDelete} icon={<MdDelete size={64} />}>
				Are you sure you want to delete these models?
			</ConfirmationModal>

			{/* Delete Success Message */}
			<MessageModal
				state={showMessageModal}
				setState={() => {
					setShowMessageModal(false);
					window.location.reload();
				}}
			>
				Selected models has been successfully deleted.
			</MessageModal>

			{/* Page Card */}
			<Card className="my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20 pb-5">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Detection Models</h1>
				</header>
				<section className={`flex ${selected.size == 0 ? "justify-end" : "justify-between"}`}>
					<section
						className={`${
							selected.size == 0 && "hidden"
						} flex flex-row gap-4 bg-custom-green-3 items-center rounded-lg drop-shadow-md outline-custom-green-1 w-fit h-fit px-6 py-3`}
					>
						<span className="flex flex-row items-center text-sm text-gray-500 font-medium">
							<MdOutlineClose size={26} className="mr-2 p-1 rounded-lg hover:bg-gray-200" onClick={() => setSelected(new Set())} />
							You have selected {selected.size} model(s).
						</span>
						<div className="flex flex-row gap-2">
							<Button color="failure" className="text-sm text-white font-medium shadow-md py-0" onClick={() => setShowDeleteModal(true)}>
								<MdDelete size={16} />
								<span className="ml-1 text-xs">Delete</span>
							</Button>
						</div>
					</section>
					<div className="flex flex-col md:items-end gap-1 px-4 py-2 shadow-md rounded-lg bg-custom-white w-full md:w-fit">
						<span className="font-semibold flex flex-col md:items-end">
							<h2 className="font-bold text-lg">Storage used</h2>
							<span className="ml-1 font-bold text-green-900">
								{formatBytes(usedStorageSize)} / {formatBytes(userInfo.storage_limit * Math.pow(1024, 2))}
								{` (${(Math.round((10000 * usedStorageSize) / (userInfo.storage_limit * Math.pow(1024, 2))) / 100).toFixed(2)}%)`}
							</span>
						</span>
						<Progress
							className="bg-custom-brown-3 text-white w-full md:w-72"
							color="green"
							progress={Math.round((10000 * usedStorageSize) / (userInfo.storage_limit * Math.pow(1024, 2))) / 100}
							size="xl"
						/>
					</div>
				</section>
				<section className="flex flex-row justify-end items-center">
					<Button
						className="bg-custom-green-1 hover:bg-custom-green-2 ring-custom-green-1 hover:ring-custom-green-2 pl-3 pr-4 items-center shadow-md"
						onClick={() => navigate("/user/active_learn")}
					>
						<div className="flex flex-row justify-center items-center ">
							<MdAddCircle size={16} />
							<span className="ml-2 font-bold text-center">Train New Model</span>
						</div>
					</Button>
				</section>
				<section className="flex flex-col xl:flex-row justify-between gap-4">
					<div className="flex flex-col md:flex-row justify-start gap-4">
						<DoubleDatePicker filter={filter} setFilter={setFilter} min_date_key="min_date" max_date_key="max_date" />
						<div className="flex flex-col sm:flex-row gap-4">
							<DropdownCheckbox
								filter={filter}
								setFilter={setFilter}
								label="Status"
								update_key="status"
								icon={<GrStatusInfo size={20} className="text-gray-400" />}
							/>
							<DropdownDoubleSlider
								label={"No. of Data"}
								dropdown_label={"No. of Training Data"}
								filter={filter}
								setFilter={setFilter}
								min_update_key="min_num_data"
								max_update_key="max_num_data"
								upper_limit={max_num_data}
								icon={<CgPerformance size={20} className="text-gray-400" />}
							/>
						</div>
					</div>
					<div className="flex flex-col justify-end md:w-1/2 xl:w-1/3 mt-2 sm:mt-0">
						<TextInput id="Search" placeholder="Search Model" icon={FaSearch} onChange={(event) => setSearch(event.target.value)} />
					</div>
				</section>
				<section>
					<ModelsTable models={searchFilter()} selected={selected} setSelected={setSelected} />
				</section>
			</Card>
		</div>
	);
}

export default ModelManagementPage;
