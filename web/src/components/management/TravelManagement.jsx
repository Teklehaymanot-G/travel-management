import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import { travelStatusOptions } from "../../utils/dummyData";
import {
  getTravels,
  createTravel,
  updateTravel,
  deleteTravel,
} from "../../services/travelService";

const TravelManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // retained for inline edits; new travel uses dedicated page
  const [currentTravel, setCurrentTravel] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  // Removed loading state (unused); can be reintroduced when adding UI feedback

  const fetchTravels = async (override = {}) => {
    try {
      const params = {
        ...(filter !== "all" ? { status: filter } : {}),
        ...(query ? { search: query } : {}),
        ...override,
      };
      const data = await getTravels(params);
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      console.error("Failed to load travels", e);
    }
  };

  useEffect(() => {
    fetchTravels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query]);

  const handleEdit = (travel) => {
    // Ensure modal has all editable fields
    setCurrentTravel({
      ...travel,
      imageUrl: travel.imageUrl || "",
      itinerary: travel.itinerary || "",
      requirements: travel.requirements || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    // Navigate to a dedicated create page for improved UX
    navigate("/admin/travels/new");
  };

  const handleDelete = async (travel) => {
    try {
      if (!travel?.id) return;
      await deleteTravel(travel.id);
      await fetchTravels();
    } catch (e) {
      console.error("Delete failed", e);
      alert("Delete failed");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentTravel) return;
      const payload = {
        title: currentTravel.title,
        startDate: currentTravel.startDate,
        endDate: currentTravel.endDate,
        price: Number(currentTravel.price) || 0,
        status: currentTravel.status,
        description: currentTravel.description,
        imageUrl: currentTravel.imageUrl,
        itinerary: currentTravel.itinerary,
        requirements: currentTravel.requirements,
      };

      if (currentTravel.id) {
        await updateTravel(currentTravel.id, payload);
      } else {
        await createTravel(payload);
      }
      await fetchTravels();
      setIsDialogOpen(false);
    } catch (e) {
      console.error("Save failed", e);
      alert("Save failed");
    }
  };

  const filteredTravels =
    filter === "all" ? items : items.filter((t) => t.status === filter);

  const travelActions = [
    { label: "Edit", onClick: handleEdit },
    {
      label: "Delete",
      onClick: handleDelete,
      className: "text-red-600 hover:text-red-900",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Travel Management</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search travels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 w-56"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Statuses</option>
            {travelStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Travel
          </button>
        </div>
      </div>

      <DataGrid
        headers={["Package", "Dates", "Price", "Bookings", "Status"]}
        rows={filteredTravels.map((travel) => ({
          data: travel,
          cells: [
            <div className="flex items-center gap-3">
              <img
                src={
                  travel.imageUrl && travel.imageUrl.trim() !== ""
                    ? travel.imageUrl
                    : ""
                }
                alt={travel.title}
                className="w-12 h-12 rounded object-cover border"
              />
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {travel.title}
                </div>
                {travel.description && (
                  <div className="text-xs text-gray-500 truncate max-w-[240px]">
                    {travel.description}
                  </div>
                )}
              </div>
            </div>,
            `${new Date(travel.startDate).toLocaleDateString()} to ${new Date(
              travel.endDate
            ).toLocaleDateString()}`,
            `$${Number(travel.price || 0).toFixed(2)}`,
            travel._count?.bookings ??
              travel.bookings?.length ??
              travel.bookings ??
              0,
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                travel.status === "PLANNED"
                  ? "bg-blue-100 text-blue-800"
                  : travel.status === "ONGOING"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {
                travelStatusOptions.find((o) => o.value === travel.status)
                  ?.label
              }
            </span>,
          ],
        }))}
        actions={travelActions}
      />

      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={
          currentTravel ? "Edit Travel Package" : "Create New Travel Package"
        }
        size="lg"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4 bg-white rounded-lg">
          {" "}
          {/* Ensure modal content is white */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentTravel?.title || ""}
              onChange={(e) =>
                setCurrentTravel({ ...currentTravel, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Header Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentTravel?.imageUrl || ""}
              onChange={(e) =>
                setCurrentTravel({ ...currentTravel, imageUrl: e.target.value })
              }
            />
            <div className="mt-2 bg-gray-100 rounded-md h-40 overflow-hidden">
              {currentTravel?.imageUrl &&
              currentTravel.imageUrl.trim() !== "" ? (
                <img
                  src={currentTravel.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://i0.wp.com/visitbalitour.com/wp-content/uploads/2015/07/bali-tour.jpg?fit=1500%2C834&ssl=1";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  No image - enter a URL above
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={currentTravel?.startDate || ""}
                onChange={(e) =>
                  setCurrentTravel({
                    ...currentTravel,
                    startDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={currentTravel?.endDate || ""}
                onChange={(e) =>
                  setCurrentTravel({
                    ...currentTravel,
                    endDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={currentTravel?.price || ""}
                onChange={(e) =>
                  setCurrentTravel({
                    ...currentTravel,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={currentTravel?.status || "PLANNED"}
                onChange={(e) =>
                  setCurrentTravel({ ...currentTravel, status: e.target.value })
                }
              >
                {travelStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentTravel?.description || ""}
              onChange={(e) =>
                setCurrentTravel({
                  ...currentTravel,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Itinerary
            </label>
            <textarea
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 whitespace-pre-wrap"
              placeholder="Day 1: ...\nDay 2: ..."
              value={currentTravel?.itinerary || ""}
              onChange={(e) =>
                setCurrentTravel({
                  ...currentTravel,
                  itinerary: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Requirements
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 whitespace-pre-wrap"
              placeholder="Passport validity, vaccination, ..."
              value={currentTravel?.requirements || ""}
              onChange={(e) =>
                setCurrentTravel({
                  ...currentTravel,
                  requirements: e.target.value,
                })
              }
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default TravelManagement;
