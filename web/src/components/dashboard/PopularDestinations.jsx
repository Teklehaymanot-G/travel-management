import React, { useMemo, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatCurrency } from "../../utils/helpers";
import apiClient from "../../services/config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PopularDestinations = ({
  destinations = [], // if provided, bypass fetch
  showChart = true,
  top = 5,
  autoFetch = true,
  limit = 5,
}) => {
  const [remote, setRemote] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (destinations.length === 0 && autoFetch) {
      const controller = new AbortController();
      const fetchPopular = async () => {
        try {
          setLoading(true);
          setError(null);

          const url = `/analytics/popular-destinations?limit=${limit}`;
          // const url = `${base}/analytics/popular-destinations?limit=${limit}`;
          const { data } = await apiClient.get(url, {
            signal: controller.signal,
            credentials: "include",
          });

          console.log(data?.data);

          setRemote(data?.data || []);
        } catch (e) {
          if (e.name !== "AbortError") setError(e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPopular();
      return () => controller.abort();
    }
  }, [destinations.length, autoFetch, limit]);

  const source = destinations.length > 0 ? destinations : remote;
  const limited = useMemo(() => source.slice(0, top), [source, top]);

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Popular Destinations",
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.1)" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const barChartData = useMemo(
    () => ({
      labels: limited.map((d) => d.destination),
      datasets: [
        {
          label: "Bookings",
          data: limited.map((d) => d.bookings),
          backgroundColor: "rgba(139, 92, 246, 0.8)",
          borderColor: "rgb(139, 92, 246)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    }),
    [limited]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Popular Destinations
        </h2>
        <span role="img" aria-label="trend" className="text-lg">
          📈
        </span>
      </div>
      {loading && (
        <div className="text-sm text-gray-500 animate-pulse">Loading...</div>
      )}
      {error && !loading && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}
      {showChart && !loading && !error && limited.length > 0 && (
        <Bar options={barChartOptions} data={barChartData} />
      )}
      {!loading && !error && limited.length === 0 && (
        <div className="text-sm text-gray-500">
          No destination data available.
        </div>
      )}
      <div className="mt-6 space-y-3">
        {limited.map((destination, index) => (
          <div
            key={destination.destination + index}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-semibold">
                {index + 1}
              </div>
              <span className="font-medium text-gray-900">
                {destination.destination}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {destination.bookings} bookings
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(destination.revenue)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularDestinations;
