import { format, getDate, getHours, getMonth, getYear, isSameDay } from "date-fns";
import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

function WeatherForecastChart({ data, date, type = "bar", measurement = "temperature_2m", show_labels = true }) {
	const unit = date == "all" ? "day" : "hour";

	const getchartData = () => {
		let preprocessed_data = [];

		if (unit == "hour") {
			data.hourly[measurement].forEach((element, index) => {
				const processed_time = new Date(
					getYear(data.hourly.time[index]),
					getMonth(data.hourly.time[index]),
					getDate(data.hourly.time[index]),
					getHours(data.hourly.time[index])
				);
				if (isSameDay(processed_time, date)) {
					preprocessed_data.push({
						x: processed_time.getTime(),
						y: element,
					});
				}
			});
		} else {
			data.daily[measurement].forEach((element, index) => {
				const processed_time = new Date(getYear(data.daily.time[index]), getMonth(data.daily.time[index]), getDate(data.daily.time[index]));
				preprocessed_data.push({
					x: processed_time.getTime(),
					y: element,
				});
			});
		}
		return preprocessed_data;
	};

	const getMinTempData = () => {
		const preprocessed_data = data.daily["temperature_2m_min"].map((element, index) => {
			const processed_time = new Date(getYear(data.daily.time[index]), getMonth(data.daily.time[index]), getDate(data.daily.time[index]));
			return {
				x: processed_time.getTime(),
				y: element,
			};
		});
		return preprocessed_data;
	};

	const getMaxTempData = () => {
		const preprocessed_data = data.daily["temperature_2m_max"].map((element, index) => {
			const processed_time = new Date(getYear(data.daily.time[index]), getMonth(data.daily.time[index]), getDate(data.daily.time[index]));
			return {
				x: processed_time.getTime(),
				y: element,
			};
		});
		return preprocessed_data;
	};

	var series = [];
	var y_annotations = [];

	// Series
	if (unit == "day" && measurement == "temperature_2m") {
		series.push(
			{
				name: `Minimum Temperature (${data.daily_units.temperature_2m_min})`,
				data: getMinTempData(),
			},
			{
				name: `Maximum Temperature (${data.daily_units.temperature_2m_max})`,
				data: getMaxTempData(),
			}
		);
	} else {
		series.push({
			name: `${measurement} (${data[unit == "hour" ? "hourly_units" : "daily_units"][measurement]})`,
			data: getchartData(),
		});
	}

	// Annotations
	if (unit != "day" || measurement != "temperature_2m") {
		const y_val = (
			Math.round(
				(data[unit == "hour" ? "hourly" : "daily"][measurement].reduce((a, b) => a + b, 0) /
					data[unit == "hour" ? "hourly" : "daily"][measurement].length) *
					100
			) / 100
		).toFixed(2);

		y_annotations.push({
			y: y_val,
			borderColor: "#09694d",
			fillColor: "#09694d",
			strokeDashArray: 4,
			label: {
				show: true,
				offsetY: 6,
				text: (unit == "hour" ? "Hourly Average: " : "Daily Average: ") + y_val,
				style: {
					padding: { top: 10, left: 10, right: 10, bottom: 10 },
					color: "#FFFFFF",
					background: "#09694d",
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
					return format(new Date(timestamp), unit == "hour" ? "HH:00" : "dd MMM yyyy");
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
				format: unit == "hour" ? "HH:00, dd MMM yyyy" : "dd MMM yyyy",
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
			},
		},
	};

	return <ReactApexChart options={options} series={series} type={type} height={750} />;
}

export default WeatherForecastChart;
