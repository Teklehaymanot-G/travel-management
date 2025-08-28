import React, { useState } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import { users } from "../../utils/dummyData";

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("all");

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (user) => {
    console.log("Delete user:", user);
    alert(`Delete user: ${user.name}`);
  };

  const filteredUsers =
    filter === "all" ? users : users.filter((u) => u.role === filter);

  const userActions = [
    { label: "Edit", onClick: handleEdit },
    {
      label: "Delete",
      onClick: handleDelete,
      className: "text-red-600 hover:text-red-900",
    },
  ];

  const roleOptions = [
    { value: "TRAVELER", label: "Traveler" },
    { value: "SUPERVISOR", label: "Supervisor" },
    { value: "MANAGER", label: "Manager" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Roles</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New User
          </button>
        </div>
      </div>

      <DataGrid
        headers={["Name", "Phone", "Role"]}
        rows={filteredUsers.map((user) => [
          user.name,
          user.phone,
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              user.role === "MANAGER"
                ? "bg-purple-100 text-purple-800"
                : user.role === "SUPERVISOR"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {user.role}
          </span>,
        ])}
        actions={userActions}
      />

      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentUser ? "Edit User" : "Create New User"}
        onSubmit={() => {
          console.log("Save user:", currentUser);
          setIsDialogOpen(false);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentUser?.name || ""}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentUser?.phone || ""}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={currentUser?.role || "TRAVELER"}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, role: e.target.value })
              }
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {!currentUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value=""
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, password: e.target.value })
                }
              />
            </div>
          )}
        </div>
      </FormDialog>
    </div>
  );
};

export default UserManagement;
