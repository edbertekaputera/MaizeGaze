import React, { useEffect, useState, useRef  } from "react";
import axios from "axios";
import { Card, Select } from "flowbite-react";
import DoubleDatePicker from "../DoubleDatePicker";
import {
	isThisMonth,
	isThisQuarter,
	isThisWeek,
	isThisYear,
	isToday,
	subDays,
    eachDayOfInterval,
    format
} from "date-fns";
import Chart from "chart.js/auto";

function TasselCountSummaryCard({ className }) {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState({
		farm_name: "all",
		startDate: -1,
		endDate: new Date(),
	});

	const [farm, setFarm] = useState([]);
	const chartRef = useRef(null); 
    const chartInstance = useRef(null);

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
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisMonthTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisMonth(result.record_date) &&
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisQuarterTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisQuarter(result.record_date) &&
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisYearTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisYear(result.record_date) &&
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getFilteredData = () => {
		return data.filter((result) => {
			return (
				filter.farm_name == "all" || filter.farm_name == result.farm_name
			);
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

	const getchartData = (startDate, endDate) => {
        const daysArray = eachDayOfInterval({ start: startDate, end: endDate });

        const formattedDaysArray = daysArray.map((day) => format(day, "yyyy-MM-dd"));
        const countsByDate = Object.fromEntries(
            formattedDaysArray.map((date) => [date, 0])
        );

        getFilteredData().forEach((record) => {
            const formattedDate = format(record.record_date, "yyyy-MM-dd");
            if (formattedDate in countsByDate) {
                countsByDate[formattedDate] = record.tassel_count;
            }
        });

        return {
            labels: formattedDaysArray,
            datasets: [
                {
                    label: "Tassel Count",
                    data: Object.values(countsByDate),
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
            ],
        };
    };

	useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy(); 
        }

        const ctx = chartRef.current.getContext("2d");

		const startDate = subDays(new Date(), 6) // put start date here
		const endDate = new Date() // put end date here

        const chartData = getchartData(startDate,endDate);

        chartInstance.current = new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

		const resizeChart = () => {
            chartInstance.current.resize();
        };
        window.addEventListener("resize", resizeChart);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, selectedFarm]);

	return (
		<>
			<Card className={"shadow-lg border " + className}>
				<header className="flex flex-wrap flex-row gap-2 justify-end shadow-b pb-2 border-black">
					{/* <h1 className="text-4xl font-extrabold">Tassel Count Summary</h1> */}
					<Select
						id="farm_input"
						value={filter.farm_name}
						color="success"
						className="shadow drop-shadow-md rounded-lg hover:outline outline-custom-green-2"
						onChange={(ev) =>
							setFilter((prev) => ({
								...prev,
								farm_name: ev.target.value,
							}))
						}
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
				<section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
                        <h2 className="text-xl mb-3 font-bold drop-shadow-sm">
							Week
						</h2>
                        <span className="text-3xl font-semibold text-custom-green-1">
							{getThisWeekTotal()}
						</span>
                    </div>
                        <div className="bg-white shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
                        <h2 className="text-xl mb-3 font-bold drop-shadow-sm">
							Month
						</h2>
                        <span className="text-3xl font-semibold text-custom-green-1">
								{getThisMonthTotal()}
						</span>
                    </div>
                        <div className="bg-white shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
                        <h2 className="text-xl mb-3 font-bold drop-shadow-sm">
							Quarter
						</h2>
                        <span className="text-3xl font-semibold text-custom-green-1">
								{getThisQuarterTotal()}
						</span>
                    </div>
                        <div className="bg-white shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
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
				<section className="mt-8 w-full">
					<canvas ref={chartRef} />
				</section>
			</Card>
		</>
	);
}

export default TasselCountSummaryCard;
