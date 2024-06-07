import {
	eachDayOfInterval,
	eachMonthOfInterval,
	eachQuarterOfInterval,
	eachYearOfInterval,
	format,
	isBefore,
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
		const {
			y: yValue,
			label,
			color,
			lineWidth,
			drawTime = "beforeDatasetsDraw",
		} = options;

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

function TasselCountChart({
	data,
	startDate,
	endDate,
	daily_average,
	type = "bar",
	unit = "day",
}) {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	useEffect(() => {
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const ctx = chartRef.current.getContext("2d");

		const chartData = {
			datasets: [
				{
					label: "Tassel Count",
					data: getchartData(),
					backgroundColor: "rgba(54, 162, 235, 0.6)",
				},
				{
					label: "Daily Average",
					data: [daily_average],
					borderColor: "red",
					borderDash: [5, 5],
					backgroundColor: "red",
					showLine: true,
					pointRadius: 0,
				},
			],
		};

		const option = {
			plugins: {
				legend: {
					display: true,
					position: "top",
				},
				horizontalLine: {
					y: daily_average, // y-value where the line should be drawn
					color: "red", // Optional color for the line and label
					lineWidth: 1, // Optional line width
					drawTime: "afterDatasetsDraw",
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
						minUnit: "day",
						displayFormats: {
							day: "dd MMM yyyy",
							quarter: "QQQ yyyy",
						},
					},
				},
			},
		};

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
	}, [data]);

	const getchartData = () => {
		let startTickerDate = startDate;
		if (startDate === -1) {
			startTickerDate = data.reduce(
				(min, value) =>
					isBefore(min, value.record_date) ? min : value.record_date,
				new Date()
			);
		}

		if (unit == "day") {
			const interval = eachDayOfInterval({
				start: startTickerDate,
				end: endDate,
			});
			let tickerArray = Object.fromEntries(
				interval.map((date) => [format(date, "yyyy-MM-dd"), 0])
			);
			data.forEach((record) => {
				const formattedDate = format(record.record_date, "yyyy-MM-dd");
				if (formattedDate in tickerArray) {
					tickerArray[formattedDate] += record.tassel_count;
				}
			});
			return Object.entries(tickerArray).map((element) => ({
				x: new Date(element[0]),
				y: element[1],
			}));
		} else if (unit == "month") {
			const interval = eachMonthOfInterval({
				start: startTickerDate,
				end: endDate,
			});
			let tickerArray = Object.fromEntries(
				interval.map((date) => [format(date, "yyyy-MM"), 0])
			);
			data.forEach((record) => {
				const formattedDate = format(record.record_date, "yyyy-MM");
				if (formattedDate in tickerArray) {
					tickerArray[formattedDate] += record.tassel_count;
				}
			});
			return Object.entries(tickerArray).map((element) => ({
				x: new Date(element[0]),
				y: element[1],
			}));
		} else if (unit == "quarter") {
			const interval = eachQuarterOfInterval({
				start: startTickerDate,
				end: endDate,
			});
			let tickerArray = Object.fromEntries(
				interval.map((date) => [format(date, "yyyy-Q"), 0])
			);
			data.forEach((record) => {
				const formattedDate = format(record.record_date, "yyyy-Q");
				if (formattedDate in tickerArray) {
					tickerArray[formattedDate] += record.tassel_count;
				}
			});
			return Object.entries(tickerArray).map((element) => {
				const splitted = element[0].split("-");
				const quarter_month = parseInt(splitted[1]) * 3 - 1;
				return {
					x: new Date(splitted[0], quarter_month),
					y: element[1],
				};
			});
		} else {
			const interval = eachYearOfInterval({
				start: startTickerDate,
				end: endDate,
			});
			let tickerArray = Object.fromEntries(
				interval.map((date) => [format(date, "yyyy"), 0])
			);
			data.forEach((record) => {
				const formattedDate = format(record.record_date, "yyyy");
				if (formattedDate in tickerArray) {
					tickerArray[formattedDate] += record.tassel_count;
				}
			});
			return Object.entries(tickerArray).map((element) => ({
				x: new Date(element[0]),
				y: element[1],
			}));
		}
	};

	return <canvas ref={chartRef} />;
}

export default TasselCountChart;
