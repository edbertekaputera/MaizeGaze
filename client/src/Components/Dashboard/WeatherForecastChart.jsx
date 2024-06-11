import {
	eachDayOfInterval,
	eachMonthOfInterval,
	eachQuarterOfInterval,
	eachYearOfInterval,
	format,
	getDate,
	getHours,
	getMonth,
	getYear,
	isBefore,
	isSameDay,
	subDays,
} from "date-fns";
import { Chart, registerables } from "chart.js/auto";
import React, { useEffect, useRef, useState } from "react";
import "chartjs-adapter-date-fns";

const HorizontalLinePlugin = {
	id: "horizontalLine",
	afterDatasetsDraw: (chart, args, options) => {
		const {
			ctx,
			scales: { y },
		} = chart;
		const { y: yValue, label, color, lineWidth, drawTime = "beforeDatasetsDraw" } = options;

		if (drawTime === "afterDatasetsDraw") {
			// Check if the y-value is within the chart area
			if (yValue >= y.min && yValue <= y.max) {
				// Calculate the y-coordinate of the line
				const yCoordinate = y.getPixelForValue(yValue);

				// Draw the line
				ctx.beginPath();
				ctx.moveTo(chart.chartArea.left, yCoordinate);
				ctx.lineTo(chart.chartArea.right, yCoordinate);
				ctx.strokeStyle = color || "black";
				ctx.lineWidth = lineWidth || 1;
				ctx.setLineDash([5, 5]); // Set the line dash pattern for a dotted line
				ctx.stroke();
				ctx.closePath();

				// Draw the label
				if (label) {
					ctx.font = "12px Arial";
					ctx.fillStyle = color || "black";
					ctx.fillText(label, chart.chartArea.left - 10, yCoordinate);
				}
			}
		}

		// Return a dataset object representing the horizontal line
		return {
			label: label || "Horizontal Line",
			data: [yValue],
			borderColor: color || "black",
			borderDash: [5, 5],
			borderWidth: lineWidth || 1,
			showLine: true,
			pointRadius: 0,
		};
	},
};

// Register the necessary Chart.js components
Chart.register(...registerables);
Chart.register(HorizontalLinePlugin);

function WeatherForecastChart({ data, date, type = "bar", measurement = "temperature_2m" }) {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);
	const unit = date == "all" ? "day" : "hour";

	useEffect(() => {
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const ctx = chartRef.current.getContext("2d");
		console.log("inside data", data);
		console.log("inside measurement", measurement);
		console.log("inisde unit", unit);
		const chartData = {
			datasets: [],
		};

		if (unit == "day" && measurement == "temperature_2m") {
			chartData.datasets.push(
				{
					label: `Minimum Temperature (${data.daily_units.temperature_2m_min})`,
					data: getMinTempData(),
					backgroundColor: "rgba(54, 162, 235, 0.6)",
				},
				{
					label: `Maximum Temperature (${data.daily_units.temperature_2m_max})`,
					data: getMaxTempData(),
					backgroundColor: "rgba(235, 54, 54, 0.6)",
				}
			);
		} else {
			chartData.datasets.push({
				label: `${measurement} (${data[unit == "hour" ? "hourly_units" : "daily_units"][measurement]})`,
				data: getchartData(),
				backgroundColor: "rgba(54, 162, 235, 0.6)",
			});
		}

		const option = {
			plugins: {
				legend: {
					display: true,
					position: "top",
				},
			},
			scales: {
				y: {
					beginAtZero: true,
				},
				x: {
					type: "timeseries",
					time: {
						unit: unit,
						minUnit: "hour",
						displayFormats: {
							hour: "HH:00",
							day: "dd MMM yyyy",
						},
					},
				},
			},
		};

		if (unit != "day" || measurement != "temperature_2m") {
			option.plugins.horizontalLine = {
				y: (
					Math.round(
						(data[unit == "hour" ? "hourly" : "daily"][measurement].reduce((a, b) => a + b, 0) /
							data[unit == "hour" ? "hourly" : "daily"][measurement].length) *
							100
					) / 100
				).toFixed(2), // y-value where the line should be drawn
				color: "red", // Optional color for the line and label
				lineWidth: 1, // Optional line width
				drawTime: "afterDatasetsDraw",
			};
		}

		chartInstance.current = new Chart(ctx, {
			type: type,
			data: chartData,
			options: option,
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
	}, [data, measurement, date]);

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
						x: processed_time,
						y: element,
					});
				}
			});
		} else {
			data.daily[measurement].forEach((element, index) => {
				const processed_time = new Date(getYear(data.daily.time[index]), getMonth(data.daily.time[index]), getDate(data.daily.time[index]));
				preprocessed_data.push({
					x: processed_time,
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
				x: processed_time,
				y: element,
			};
		});
		return preprocessed_data;
	};

	const getMaxTempData = () => {
		const preprocessed_data = data.daily["temperature_2m_max"].map((element, index) => {
			const processed_time = new Date(getYear(data.daily.time[index]), getMonth(data.daily.time[index]), getDate(data.daily.time[index]));
			return {
				x: processed_time,
				y: element,
			};
		});
		return preprocessed_data;
	};

	return <canvas ref={chartRef} />;
}

export default WeatherForecastChart;
