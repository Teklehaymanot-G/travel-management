import React, { useEffect, useMemo, useState } from "react";
import {
  getSummary,
  getPayments,
  getCheckins,
  getCouponUsage,
  getTravelComparison,
} from "../../services/reportService";
import { getTravels } from "../../services/travelService";
import { getBanks } from "../../services/bankService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
// charts are used in child sections; only ChartJS registration needed here
import Filters from "./reports/Filters";
import TabsNav from "./reports/TabsNav";
import SummarySection from "./reports/SummarySection";
import PaymentsSection from "./reports/PaymentsSection";
import CheckinsSection from "./reports/CheckinsSection";
import ComparisonSection from "./reports/ComparisonSection";
import CouponsSection from "./reports/CouponsSection";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const todayISO = () => new Date().toISOString().slice(0, 10);
const subDaysISO = (n) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

function csvDownload(filename, rows) {
  const processVal = (v) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };
  const cols = Object.keys(rows[0] || {});
  const header = cols.join(",");
  const body = rows
    .map((r) =>
      cols.map((c) => `"${processVal(r[c]).replaceAll('"', '""')}"`).join(",")
    )
    .join("\n");
  const content = [header, body].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ReportsDashboard = () => {
  const [filters, setFilters] = useState({
    from: subDaysISO(30),
    to: todayISO(),
    travelId: "all",
    status: "all",
    bank: "all",
    couponCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState({
    total: 0,
    page: 1,
    limit: 20,
    items: [],
  });
  const [checkins, setCheckins] = useState({
    totalTickets: 0,
    totalChecked: 0,
    buckets: {},
    recent: [],
  });
  const [travels, setTravels] = useState([]);
  const [banks, setBanks] = useState([]);
  const [travelCompare, setTravelCompare] = useState({ items: [] });
  const [couponUsage, setCouponUsage] = useState({ items: [] });
  const [activeTab, setActiveTab] = useState("summary");

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const baseParams = {
        from: filters.from,
        to: filters.to,
        ...(filters.travelId !== "all" ? { travelId: filters.travelId } : {}),
      };
      const sum = await getSummary(baseParams);
      setSummary(sum);

      const payParams = {
        ...baseParams,
        page,
        limit: payments.limit,
        ...(filters.status !== "all" ? { status: filters.status } : {}),
        ...(filters.bank !== "all" ? { bank: filters.bank } : {}),
        ...(filters.couponCode ? { couponCode: filters.couponCode } : {}),
      };
      const pay = await getPayments(payParams);
      setPayments(pay);

      const chk = await getCheckins(baseParams);
      setCheckins(chk);

      const cmp = await getTravelComparison(baseParams);
      setTravelCompare(cmp);

      const cup = await getCouponUsage(baseParams);
      setCouponUsage(cup);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load travels and banks for filters
    (async () => {
      try {
        const t = await getTravels({ page: 1, limit: 1000 });
        setTravels(t.items || t.data || []);
      } catch {
        /* ignore travel fetch errors */
      }
      try {
        const b = await getBanks({ status: "ACTIVE" });
        setBanks(b.items || b.data || b || []);
      } catch {
        /* ignore bank fetch errors */
      }
    })();
  }, []);

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.from,
    filters.to,
    filters.travelId,
    filters.status,
    filters.bank,
    filters.couponCode,
  ]);

  const chartData = useMemo(() => {
    const byDay = summary?.payments?.revenueByDay || {};
    const labels = Object.keys(byDay).sort();
    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: labels.map((d) => byDay[d] || 0),
          borderColor: "#2563EB",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [summary]);

  const compareChartData = useMemo(() => {
    const items = travelCompare.items || [];
    const top = items.slice(0, 10);
    return {
      labels: top.map((i) => i.travelTitle || `Travel ${i.travelId}`),
      datasets: [
        {
          label: "Revenue",
          data: top.map((i) => i.revenue || 0),
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
        {
          label: "Bookings",
          data: top.map((i) => i.bookings || 0),
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [travelCompare]);

  const onExportPayments = () => {
    const rows = payments.items.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      status: p.status,
      bank: p.bank,
      transactionNumber: p.transactionNumber,
      finalAmount: p.finalAmount,
      originalAmount: p.originalAmount,
      discountAmount: p.discountAmount,
      travel: p.booking?.travel?.title,
      traveler: p.booking?.traveler?.name,
    }));
    csvDownload(`payments-${filters.from}-to-${filters.to}.csv`, rows);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  // moved StatCard and icons into ./reports/StatCard

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600">
            Comprehensive reports and insights for your travel business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onExportPayments}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => loadData(1)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <Filters
        filters={filters}
        setFilters={setFilters}
        travels={travels}
        banks={banks}
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === "summary" && (
            <SummarySection
              summary={summary}
              checkins={checkins}
              chartData={chartData}
              chartOptions={chartOptions}
            />
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <PaymentsSection
              payments={payments}
              onPageChange={(page) => loadData(page)}
            />
          )}

          {/* Check-ins Tab */}
          {activeTab === "checkins" && <CheckinsSection checkins={checkins} />}

          {/* Comparison Tab */}
          {activeTab === "compare" && (
            <ComparisonSection
              travelCompare={travelCompare}
              compareChartData={compareChartData}
              chartOptions={chartOptions}
            />
          )}

          {/* Coupons Tab */}
          {activeTab === "coupons" && (
            <CouponsSection couponUsage={couponUsage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
