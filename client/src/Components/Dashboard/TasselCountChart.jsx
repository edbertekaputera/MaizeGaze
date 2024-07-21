import { format, isSameDay, max, startOfMonth, startOfYear, subMonths, subYears } from "date-fns";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import { Button, Label, Select } from "flowbite-react";
import DoubleDatePicker from "../DoubleDatePicker";

function TasselCountChart({ data, interpolated_data, daily_average, interpolated_daily_average, show_labels = true }) {
	const [type, setType] = useState("area");
	const [selection, setSelection] = useState("all");
	const [filter, setFilter] = useState({
		start_date: -1,
		end_date: new Date(),
	});

	// Handle Datepicker filter
	useEffect(() => {
		if (selection == "custom") {
			updateData(selection);
		}
	}, [filter]);
	// Handle Button Filter
	useEffect(() => {
		updateData(selection);
	}, [selection]);

	const updateData = (timeline) => {
		switch (timeline) {
			case "one_month":
				ApexCharts.exec("area-datetime", "zoomX", subMonths(new Date(), 1).getTime(), new Date().getTime());
				break;
			case "six_months":
				ApexCharts.exec("area-datetime", "zoomX", subMonths(new Date(), 6).getTime(), new Date().getTime());
				break;
			case "one_year":
				ApexCharts.exec("area-datetime", "zoomX", subYears(new Date(), 1).getTime(), new Date().getTime());
				break;
			case "ytd":
				ApexCharts.exec("area-datetime", "zoomX", startOfYear(new Date()).getTime(), new Date().getTime());
				break;
			case "all":
				ApexCharts.exec("area-datetime", "resetSeries");
				break;
			case "custom":
				if (filter.start_date == -1) {
					ApexCharts.exec("area-datetime", "zoomX", data[0].record_date.getTime(), filter.end_date.getTime());
				} else {
					ApexCharts.exec("area-datetime", "zoomX", filter.start_date.getTime(), filter.end_date.getTime());
				}
				break;
			default:
		}
	};

	var series = [
		{
			name: "Tassel Count",
			data: data.map((val) => ({ x: val.record_date.getTime(), y: val.tassel_count })),
		},
	];

	var y_annotations = [
		{
			y: daily_average,
			borderColor: "#09694d",
			fillColor: "#09694d",
			strokeDashArray: 4,
			label: {
				show: true,
				offsetY: 6,
				text: "Daily Average: " + daily_average,
				style: {
					padding: { top: 10, left: 10, right: 10, bottom: 10 },
					color: "#FFFFFF",
					background: "#09694d",
				},
			},
		},
	];

	if (interpolated_data) {
		series.push({
			name: "Interpolated Tassel Count",
			data: interpolated_data.map((val) => ({ x: val.record_date.getTime(), y: val.tassel_count })),
		});
		y_annotations.push({
			y: interpolated_daily_average,
			borderColor: "#C41E3A",
			fillColor: "#C41E3A",
			strokeDashArray: 4,
			label: {
				show: true,
				offsetY: 6,
				text: "Interpolated Daily Average: " + interpolated_daily_average,
				style: {
					padding: { top: 10, left: 10, right: 10, bottom: 10 },
					color: "#FFFFFF",
					background: "#C41E3A",
				},
			},
		});
	}

	const options = {
		chart: {
			id: "area-datetime",
			type: type,
			toolbar: {
				show: false,
			},
			zoom: { enabled: false },
		},
		dataLabels: {
			enabled: show_labels,
			hideOverflowingLabels: true,
		},
		stroke: {
			curve: "smooth",
		},
		xaxis: {
			type: "datetime",
			labels: {
				formatter: function (value, timestamp) {
					return format(new Date(timestamp), "dd MMM yyyy");
				},
				max: new Date().getTime(),
			},

			datetimeUTC: false,
		},
		annotations: {
			yaxis: y_annotations,
		},
		tooltip: {
			x: {
				format: "dd MMM yyyy",
			},
		},
		colors: ["#019A6C", "#E91E63"],
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.7,
				opacityTo: 0.9,
			},
		},
		markers: {
			size: 5,
			colors: ["#019A6C", "#E91E63"],
			strokeColors: "#fff",
			strokeWidth: 2,
			hover: {
			  size: 8,
			}
		  },
	};
	return (
		<div className="flex flex-col gap-y-4">
			<div className="flex flex-col sm:flex-row justify-between gap-x-4 gap-y-4">
				<div className="flex flex-col sm:flex-row gap-x-2 gap-y-4 item-center sm:items-start">
					<div className="flex flex-row gap-x-2 justify-between sm:justify-start w-full">
						<Select
							// icon={PiFarmFill}
							id="chart_type"
							value={type}
							color="light"
							className="rounded-lg hover:outline outline-custom-green-1 grow min-w-24 "
							onChange={(ev) => setType(ev.target.value)}
						>
							<option key={"area"} value={"area"}>
								Line
							</option>
							<option key={"bar"} value={"bar"}>
								Bar
							</option>
						</Select>
						<Button
							id="one_month"
							onClick={() => setSelection("one_month")}
							className={
								selection === "one_month"
									? "bg-custom-green-1 ring-inset ring-custom-green-1"
									: "bg-white border-gray-300 text-black hover:bg-gray-100 ring-inset ring-gray-100"
							}
						>
							1M
						</Button>

						<Button
							id="six_months"
							onClick={() => setSelection("six_months")}
							className={
								selection === "six_months"
									? "bg-custom-green-1 ring-inset ring-custom-green-1"
									: "bg-white border-gray-300 text-black hover:bg-gray-100 ring-inset ring-gray-100"
							}
						>
							6M
						</Button>

						<Button
							id="one_year"
							onClick={() => setSelection("one_year")}
							className={
								selection === "one_year"
									? "bg-custom-green-1 ring-inset ring-custom-green-1"
									: "bg-white border-gray-300 text-black hover:bg-gray-100 ring-inset ring-gray-100"
							}
						>
							1Y
						</Button>
					</div>
					<div className="flex flex-row gap-x-2 justify-between sm:justify-start w-full">
						<Button
							id="ytd"
							onClick={() => setSelection("ytd")}
							className={
								selection === "ytd"
									? "bg-custom-green-1 ring-inset ring-custom-green-1"
									: "bg-white border-gray-300 text-black hover:bg-gray-100 ring-inset ring-gray-100"
							}
						>
							YTD
						</Button>

						<Button
							id="all"
							onClick={() => setSelection("all")}
							className={
								selection === "all"
									? "bg-custom-green-1 ring-inset ring-custom-green-1"
									: "bg-white border-gray-300 text-black hover:bg-gray-100 ring-inset ring-gray-100"
							}
						>
							ALL
						</Button>
						<Button
							id="custom"
							onClick={() => setSelection("custom")}
							className={
								selection === "custom"
									? "bg-custom-green-1 ring-inset ring-custom-green-1 grow"
									: "bg-white border-gray-300 text-black hover:bg-gray-100 ring-inset ring-gray-100 grow"
							}
						>
							CUSTOM
						</Button>
					</div>
				</div>

				{selection == "custom" && <DoubleDatePicker filter={filter} setFilter={setFilter} min_date_key="start_date" max_date_key="end_date" />}
			</div>
			<div id="chart-timeline" className="">
				<ReactApexChart options={options} series={series} type={type} height={750}/>
			</div>
		</div>
	);
}

export default TasselCountChart;
