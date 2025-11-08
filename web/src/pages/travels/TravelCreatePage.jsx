import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTravel } from "../../services/travelService";
import Button from "../../components/ui/Button";

const TravelCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    price: "",
    status: "PLANNED",
    description: "",
    itinerary: "",
    requirements: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = "End date must be after start date";
    }
    if (form.price === "" || Number.isNaN(Number(form.price))) {
      newErrors.price = "Valid price is required";
    } else if (Number(form.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("startDate", form.startDate);
      data.append("endDate", form.endDate);
      data.append("price", String(Number(form.price)));
      data.append("status", form.status);
      data.append("description", form.description.trim());
      data.append("itinerary", form.itinerary);
      data.append("requirements", form.requirements);
      if (imageFile) data.append("image", imageFile);

      await createTravel(data);
      navigate("/admin/travels");
    } catch (err) {
      console.error("Create travel failed", err);
      alert("Failed to create travel. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Travel Package
        </h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {/* Image Upload with drag & drop */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Header Image
          </label>
          <div
            className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-600 hover:border-blue-400 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
            ) : (
              <>
                <p className="text-sm">Drag & drop an image here</p>
                <p className="text-xs text-gray-500">or</p>
                <button
                  type="button"
                  className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Supported: JPG, PNG, GIF, WEBP up to 5MB
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.title && (
            <p className="text-red-600 text-xs mt-1">{errors.title}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.startDate && (
              <p className="text-red-600 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.endDate && (
              <p className="text-red-600 text-xs mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.price && (
              <p className="text-red-600 text-xs mt-1">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <input
              type="text"
              value="PLANNED"
              disabled
              className="mt-1 block w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md shadow-sm p-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Status is set to Planned on creation.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Itinerary
          </label>
          <textarea
            rows={6}
            value={form.itinerary}
            onChange={(e) => handleChange("itinerary", e.target.value)}
            placeholder="Day 1: ...\nDay 2: ..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 whitespace-pre-wrap"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Requirements
          </label>
          <textarea
            rows={4}
            value={form.requirements}
            onChange={(e) => handleChange("requirements", e.target.value)}
            placeholder="Passport validity, vaccination, ..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 whitespace-pre-wrap"
          />
        </div>
        <div className="pt-2 flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/travels")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving..." : "Create Travel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TravelCreatePage;
