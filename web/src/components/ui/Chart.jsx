import React from "react";
import Chart from "react-apexcharts";

const CustomChart = ({ title, type, series, labels, categories }) => {
  const options = {
    chart: {
      toolbar: {
        show: true,
      },
    },
    title: {
      text: title,
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#374151",
      },
    },
    colors: ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6"],
    dataLabels: {
      enabled: type !== "line",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      opacity: 0.8,
      type: "solid",
    },
    legend: {
      position: "bottom",
    },
    xaxis: {
      categories: categories || [],
    },
    tooltip: {
      y: {
        formatter: (val) => `$${val}`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: type === "donut",
            total: {
              show: true,
              label: "Total",
              formatter: () => series.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },
    labels: labels || [],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Chart options={options} series={series} type={type} height={350} />
    </div>
  );
};

export default CustomChart;
