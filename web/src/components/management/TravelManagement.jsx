import React, { useState } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import { travels, travelStatusOptions } from "../../utils/dummyData";

const TravelManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTravel, setCurrentTravel] = useState(null);
  const [filter, setFilter] = useState("all");

  const handleEdit = (travel) => {
    setCurrentTravel(travel);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setCurrentTravel(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (travel) => {
    console.log("Delete travel:", travel);
    alert(`Delete travel: ${travel.title}`);
  };

  const filteredTravels =
    filter === "all" ? travels : travels.filter((t) => t.status === filter);

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
        headers={["Title", "Dates", "Price", "Bookings", "Status"]}
        rows={filteredTravels.map((travel) => [
          travel.title,
          `${travel.startDate} to ${travel.endDate}`,
          `$${travel.price}`,
          travel.bookings,
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              travel.status === "PLANNED"
                ? "bg-blue-100 text-blue-800"
                : travel.status === "ONGOING"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {travelStatusOptions.find((o) => o.value === travel.status)?.label}
          </span>,
        ])}
        actions={travelActions}
      />

      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={
          currentTravel ? "Edit Travel Package" : "Create New Travel Package"
        }
        size="lg"
        onSubmit={() => {
          console.log("Save travel:", currentTravel);
          setIsDialogOpen(false);
        }}
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
        </div>
      </FormDialog>
    </div>
  );
};

export default TravelManagement;
