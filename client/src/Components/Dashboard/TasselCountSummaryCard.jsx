import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Select } from "flowbite-react";
import {
	isThisMonth,
	isThisQuarter,
	isThisWeek,
	isThisYear,
	isToday,
} from "date-fns";

function TasselCountSummaryCard({ className }) {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedFarm, setSelectedFarm] = useState("all");
	const [farm, setFarm] = useState([]);

	useEffect(() => {
		axios
			.get("/api/user/farm/query_all_farms_owned")
			.then((res) => {
				if (res.status === 200) {
					setFarm(res.data.farms);
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
			.get("/api/storage/query_daily_statistics")
			.then((res) => {
				setData(() =>
					res.data.result.map((items) => {
						const splitted_date = items.record_date.split("-");
						const date_obj = new Date(
							splitted_date[0],
							parseInt(splitted_date[1]) - 1,
							splitted_date[2]
						);
						return { ...items, record_date: date_obj };
					})
				);
			})
			.catch((error) => {
				console.log(error);
				alert("ERROR");
			})
			.then(setIsLoading(false));
	}, []);

	const getThisWeekTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisWeek(result.record_date) &&
				(selectedFarm == "all" || selectedFarm == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisMonthTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisMonth(result.record_date) &&
				(selectedFarm == "all" || selectedFarm == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisQuarterTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisQuarter(result.record_date) &&
				(selectedFarm == "all" || selectedFarm == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisYearTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisYear(result.record_date) &&
				(selectedFarm == "all" || selectedFarm == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getFilteredData = () => {
		return data.filter((result) => {
			return selectedFarm == "all" || selectedFarm == result.farm_name;
		});
	};

	const getDailyAverage = () => {
		let filtered_data = getFilteredData();
		console.log(filtered_data);
		return (
			Math.round(
				(filtered_data.reduce((a, b) => a + b.tassel_count, 0) /
					filtered_data.length) *
					100
			) / 100
		).toFixed(2);
	};

	return (
		<>
			<Card
				className={
					"relative my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20 " +
					className
				}
			>
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Tassel Count Summary</h1>
					<Select
						id="farm_input"
						value={selectedFarm}
						color="success"
						className="shadow drop-shadow-md rounded-lg hover:outline outline-custom-green-2"
						onChange={(ev) => setSelectedFarm(ev.target.value)}
					>
						<option key={"all"} value={"all"}>
							All
						</option>
						{farm.map((f) => (
							<option key={f.name} value={f.name}>
								{f.name}
							</option>
						))}
					</Select>
				</header>
				<div className="flex flex-col justify-center mb-2 items-center">
					<section className="grid grid-cols-2 sm:grid-cols-4 divide-custom-green-1 shadow-lg drop-shadow-sm bg-custom-green-3">
						<div className="flex flex-col justify-center items-center px-6 py-2 shadow-lg outline-gray-900 border-b sm:border-b-0 border-r border-black">
							<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
								Week
							</h2>
							<span className="text-3xl font-semibold text-custom-green-1">
								{getThisWeekTotal()}
							</span>
						</div>
						<div className="flex flex-col justify-center items-center px-6 py-2 shadow-lg outline-gray-900 border-b sm:border-b-0 sm:border-r border-black">
							<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
								Month
							</h2>
							<span className="text-3xl font-semibold text-custom-green-1">
								{getThisMonthTotal()}
							</span>
						</div>
						<div className="flex flex-col justify-center items-center px-6 py-2 shadow-lg outline-gray-900 border-r border-black">
							<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
								Quarter
							</h2>
							<span className="text-3xl font-semibold text-custom-green-1">
								{getThisQuarterTotal()}
							</span>
						</div>
						<div className="flex flex-col justify-center items-center px-6 py-2 shadow-lg outline-gray-900">
							<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
								Year
							</h2>
							<span className="text-3xl font-semibold text-custom-green-1">
								{getThisYearTotal()}000
							</span>
						</div>
					</section>
					<section className="flex flex-col w-full mt-6">
						<span className="text-lg">Daily Average :</span>
						<span className="text-2xl font-bold">
							{getDailyAverage()}
						</span>
					</section>
					<section className="">
						{/* PUT CHART HERE (USE getFilteredData() for the data) */}
					</section>
				</div>
			</Card>
		</>
	);
}

export default TasselCountSummaryCard;
