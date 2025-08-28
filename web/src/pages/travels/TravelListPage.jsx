import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TravelCard from "../../components/travel/TravelCard";
import Button from "../../components/ui/Button";
import { getTravels } from "../../services/travelService";

const TravelListPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const statusFilters = [
    { id: "all", label: "All" },
    { id: "PLANNED", label: "Planned" },
    { id: "ONGOING", label: "Ongoing" },
    { id: "COMPLETED", label: "Completed" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  const [travels, setTravels] = useState([]);

  useEffect(() => {
    const fetchTravels = async () => {
      const data = await getTravels();
      setTravels(data?.data || []);
    };
    fetchTravels();
  }, []);

  // Filter travels based on selected status and search term
  const filteredTravels = travels.filter((travel) => {
    const matchesStatus = filter === "all" || travel.status === filter;
    const matchesSearch =
      travel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      travel.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Travel Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all travel packages and itineraries
          </p>
        </div>
        <div>
          <Link to="/admin/travels/new">
            <Button variant="primary">Create New Travel</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Travels
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title or description..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === status.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter(status.id)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Travel Cards Grid */}
      {filteredTravels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTravels.map((travel) => (
            <Link to={`/admin/travels/${travel.id}`} key={travel.id}>
              <TravelCard travel={travel} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Travels Found
          </h2>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? `No travels match your search for "${searchTerm}"`
              : `There are no ${
                  filter === "all" ? "" : filter.toLowerCase()
                } travels at the moment.`}
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setFilter("all");
              setSearchTerm("");
            }}
          >
            View All Travels
          </Button>
        </div>
      )}
    </div>
  );
};

// Add default export
export default TravelListPage;
