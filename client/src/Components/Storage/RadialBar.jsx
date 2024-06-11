import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const RadialBar = ({ data }) => {
    const chartRef = useRef(null);
    let chart = null;

    useEffect(() => {
        if (chartRef && chartRef.current && data) {
            // Destroy existing chart instance if it exists
            if (chart) {
                chart.destroy();
            }

            chart = new ApexCharts(chartRef.current, {
                chart: {
                    type: 'radialBar',
                    height: '250',
                },
                series: [data],
                plotOptions: {
                    radialBar: {
                        hollow: {
                            size: '50%',
                        },
                        dataLabels: {
                            name: {
                                show: true,
                                color: '#000000',
                                fontSize: '15px',
                            },
                            value: {
                                show: true,
                                formatter: function () {
                                    return data + '%';
                                },
                                fontWeight: 'bold',
                                fontSize: '20px',
                            }
                        }
                    }
                },
                labels: ['mAP50'],
                colors: ['#019A6C'],
                tooltip: {
                    enabled: true,
                    y: {
                        formatter: function (val) {
                            return val + '%';
                        }
                    }
                }
            });
            chart.render();
        }

        // Cleanup function to destroy the chart instance on unmount or data change
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    }, [data]);

    return <div ref={chartRef}></div>;
};

export default RadialBar;