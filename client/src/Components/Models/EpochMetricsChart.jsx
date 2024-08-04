import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

function EpochMetricsChart({ series, metric, height }) {
	const options = {
		chart: {
			type: "area",
		},
		title: {
			text: `${metric}/Epoch Chart`,
			align: "center",
			style: {
				fontSize: "18px",
				fontWeight: "bold",
				color: "#263238",
			},
		},
		dataLabels: {
			enabled: true,
			hideOverflowingLabels: true,
		},
		stroke: {
			curve: "smooth",
		},
		xaxis: {
			type: "numeric",
			title: {
				text: "Epochs",
				align: "center",
				style: {
					fontSize: "12px",
					fontWeight: "bold",
					color: "#263238",
				},
			},
			tickAmount: "dataPoints",
			labels: {
				formatter: function (value) {
					return value.toFixed(0);
				},
			},
		},
		yaxis: {
			type: "numeric",
			title: {
				text: metric,
				align: "center",
				style: {
					fontSize: "12px",
					fontWeight: "bold",
					color: "#263238",
				},
			},
			labels: {
				formatter: function (value) {
					return (Math.round(value * 10000) / 10000).toFixed(4);
				},
			},
		},
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
			strokeColors: "#fff",
			strokeWidth: 2,
			hover: {
				size: 8,
			},
		},
	};

	const ordered_series = series.sort((a, b) => {
		return b.data.reduce((partialSum, x) => partialSum + x.y, 0) - a.data.reduce((partialSum, x) => partialSum + x.y, 0);
	});

	return <ReactApexChart options={options} series={ordered_series} type={"area"} height={height} />;
}

export default EpochMetricsChart;
