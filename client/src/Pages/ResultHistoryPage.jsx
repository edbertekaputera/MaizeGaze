import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import axios from "axios";
import { json, useNavigate } from "react-router-dom";
import { Button, Card, Checkbox, Dropdown, Label, Progress, TextInput, Toast } from "flowbite-react";
import DetectionResultTable from "../Components/Storage/DetectionResultTable";
import DoubleDatePicker from "../Components/DoubleDatePicker";
import DropdownCheckbox from "../Components/DropdownCheckbox";
import { PiFarmFill } from "react-icons/pi";
import { GiCorn } from "react-icons/gi";
import { BsArrowDownShort } from "react-icons/bs";
import DoubleSlider from "../Components/DoubleSlider";
import { isAfter, isBefore, isSameDay } from "date-fns";
import { FaSearch } from "react-icons/fa";
import { MdDelete, MdFileDownload, MdOutlineClose } from "react-icons/md";
import ConfirmationModal from "../Components/ConfirmationModal";
import LoadingCard from "../Components/LoadingCard";
import MessageModal from "../Components/MessageModal";
import DropdownDoubleSlider from "../Components/DropdownDoubleSlider";

function ResultHistoryPage() {
	const { userInfo } = useContext(AuthContext);
	const [usedStorageSize, setUsedStorageSize] = useState();
	const [results, setResults] = useState([]);
	const [selected, setSelected] = useState(new Set());
	const [showDownloadToast, setShowDownloadToast] = useState(false);
	const [showMessageModal, setShowMessageModal] = useState(false);
	const [showDownloadModal, setShowDownloadModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingResults, setIsLoadingResults] = useState(true);
	const [isDeleteLoading, setIsDeleteLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState({
		min_date: -1,
		max_date: new Date(),
		min_tassel_count: 0,
		max_tassel_count: 100,
		farm: {},
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
			.get("/api/user/farm/query_all_farms_owned")
			.then((res) => {
				if (res.status === 200) {
					res.data.farms.forEach((farm) => {
						setFilter((prev) => ({
							...prev,
							farm: {
								...prev.farm,
								[farm.name]: true,
							},
						}));
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

		axios
			.get("/api/storage/search_result_history")
			.then((res) => {
				if (res.status === 200) {
					setResults(res.data.result);
					const max_tc = res.data.result.reduce((acc, value) => {
						return (acc = acc > value.tassel_count ? acc : value.tassel_count);
					}, 100);
					setFilter((prev) => ({
						...prev,
						max_tassel_count: max_tc,
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
			.then(() => setIsLoadingResults(false));
	}, []);

	const handleDownload = () => {
		let data = { results_pk: [] };
		selected.forEach((val) => {
			const splitted_val = val.split("_");
			data.results_pk.push({
				id: splitted_val[2],
				farm_name: splitted_val[0],
				farm_patch_id: splitted_val[1]
			});
		});
		setIsLoading(true);
		axios
			.post("/api/storage/download_results", data, {
				responseType: "blob",
			})
			.then((res) => {
				if (res.status === 200) {
					const blob = new Blob([res.data], { type: "application/zip" });
					const fileName = res.headers["content-disposition"]?.split("=")[1] || "files.zip";
					// Create a temporary URL for the Blob
					const url = window.URL.createObjectURL(blob);

					// Create a link element
					const link = document.createElement("a");
					link.href = url;
					link.download = fileName;

					// Append the link to the document body
					document.body.appendChild(link);
					// Trigger the download
					link.click();
					// Clean up the temporary URL
					window.URL.revokeObjectURL(url);

					// Post-operations
					setSelected(new Set());
					setShowDownloadToast(true);
				} else {
					console.log(res.status);
					alert("Something went wrong!");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
			})
			.then(() => setIsLoading(false));
	};

	const handleDelete = () => {
		let data = { results_pk: [] };
		selected.forEach((val) => {
			const splitted_val = val.split("_");
			data.results_pk.push({
				id: splitted_val[2],
				farm_name: splitted_val[0],
				farm_patch_id: splitted_val[1]
			});
		});
		setIsDeleteLoading(true);
		axios
			.delete("/api/storage/delete_results", { data: data })
			.then((res) => {
				if (res.data.success) {
					setSelected(new Set());
					setShowMessageModal(true);
				} else {
					console.log(res.status);
					alert("Something went wrong!");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
			})
			.then(() => setIsDeleteLoading(false));
	};

	const formatBytes = (bytes, decimals = 2) => {
		if (!+bytes) return "0 Bytes";
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

	const max_tassel_count = results.reduce((acc, value) => {
		return (acc = acc > value.tassel_count ? acc : value.tassel_count);
	}, 100);

	const filterDateBool = (result) => {
		const splitted = result.record_date.split(" ");
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
		results.forEach((result) => {
			// Filtering
			const date_bool = filterDateBool(result);
			const farm_bool = filter.farm[result.farm_name];
			const tassel_count_bool = filter.min_tassel_count <= result.tassel_count && filter.max_tassel_count >= result.tassel_count;
			// Search keyword
			const keyword = search.toLowerCase().trim();

			const search_bool = keyword_bool(keyword, result.name) || keyword_bool(keyword, result.farm_name) || keyword_bool(keyword, result.farm_patch_name);

			if (date_bool && farm_bool && tassel_count_bool && search_bool) {
				filtered_list.push(result);
			}
		});

		return filtered_list;
	};

	return (
		<div className="min-h-screen">
			{/* Toast */}
			{showDownloadToast && (
				<Toast className="absolute right-2 top-20 z-50 bg-custom-green-1 bg-opacity-70">
					<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-custom-green-3 bg-opacity-80 text-custom-green-1">
						<MdFileDownload className="h-5 w-5" />
					</div>
					<div className="ml-3 text-sm font-semibold text-white">Result Records downloaded successfully.</div>
					<Toast.Toggle className="text-white bg-transparent" onDismiss={() => setShowDownloadToast(false)} />
				</Toast>
			)}

			{/* Loading Cards */}
			<LoadingCard show={isLoading}>Initiating Download...</LoadingCard>
			<LoadingCard show={isLoadingResults}>Loading Results...</LoadingCard>
			<LoadingCard show={isDeleteLoading}>Initiating Deletion...</LoadingCard>

			{/* Download Confirmation Modal */}
			<ConfirmationModal state={showDownloadModal} setState={setShowDownloadModal} action={handleDownload} icon={<MdFileDownload size={64} />}>
				Are you sure you want to download these detection results?
			</ConfirmationModal>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal state={showDeleteModal} setState={setShowDeleteModal} action={handleDelete} icon={<MdDelete size={64} />}>
				Are you sure you want to delete these detection results?
			</ConfirmationModal>

			{/* Delete Success Message */}
			<MessageModal
				state={showMessageModal}
				setState={() => {
					setShowMessageModal(false);
					window.location.reload();
				}}
			>
				Selected result records has been successfully deleted.
			</MessageModal>

			{/* Page Card */}
			<Card className="my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20 pb-5">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Detection Results History</h1>
				</header>
				<section className={`flex ${selected.size == 0 ? "justify-end" : "justify-between"}`}>
					<section
						className={`${
							selected.size == 0 && "hidden"
						} flex flex-row gap-4 bg-custom-green-3 items-center rounded-lg drop-shadow-md outline-custom-green-1 w-fit h-fit px-6 py-3`}
					>
						<span className="flex flex-row items-center text-sm text-gray-500 font-medium">
							<MdOutlineClose size={26} className="mr-2 p-1 rounded-lg hover:bg-gray-200" onClick={() => setSelected(new Set())} />
							You have selected {selected.size} result record(s).
						</span>
						<div className="flex flex-row gap-2">
							<Button
								className="text-sm text-white font-medium shadow-md outline-custom-green-1 bg-custom-green-2 ring-custom-green-2 hover:bg-custom-green-1 py-0"
								onClick={() => setShowDownloadModal(true)}
							>
								<MdFileDownload size={16} />
								<span className="ml-1 text-xs">Download</span>
							</Button>
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
				<section className="flex flex-col xl:flex-row justify-between gap-4">
					<div className="flex flex-col md:flex-row justify-start gap-4">
						<DoubleDatePicker filter={filter} setFilter={setFilter} min_date_key="min_date" max_date_key="max_date" />
						<div className="flex flex-col sm:flex-row gap-4">
							<DropdownCheckbox
								filter={filter}
								setFilter={setFilter}
								label="Farm"
								update_key="farm"
								icon={<PiFarmFill size={20} className="text-gray-400" />}
							/>
							<DropdownDoubleSlider
								label={"Tassel Count"}
								dropdown_label={"Tassel Count"}
								filter={filter}
								setFilter={setFilter}
								min_update_key="min_tassel_count"
								max_update_key="max_tassel_count"
								upper_limit={max_tassel_count}
								icon={<GiCorn size={20} className="text-gray-400" />}
							/>
						</div>
					</div>
					<div className="flex flex-col justify-end sm:w-1/2 sm:pr-2 xl:pr-0 xl:w-1/4 mt-2 sm:mt-0">
						<TextInput id="Search" placeholder="Search Detection Result" icon={FaSearch} onChange={(event) => setSearch(event.target.value)} />
					</div>
				</section>
				<section>
					<DetectionResultTable results={searchFilter()} selected={selected} setSelected={setSelected} />
				</section>
			</Card>
		</div>
	);
}

export default ResultHistoryPage;
