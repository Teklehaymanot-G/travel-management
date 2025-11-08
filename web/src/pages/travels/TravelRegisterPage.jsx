import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import { getTravel } from "../../services/travelService";
import { createBooking } from "../../services/bookingService";
import { useAuth } from "../../contexts/AuthContext";

const emptyTraveler = () => ({ name: "", age: "" });

const TravelRegisterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useAuth();

  const [travel, setTravel] = useState(null);
  const [travelers, setTravelers] = useState([emptyTraveler()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTravel(id);
        // support either {data: {...}} or {...}
        const t = data?.data ?? data;
        setTravel(t);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id]);

  const totalPrice = useMemo(() => {
    const price = Number(travel?.price) || 0;
    return price * travelers.length;
  }, [travel, travelers.length]);

  const setTravelerField = (index, field, value) => {
    setTravelers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addTraveler = () => setTravelers((prev) => [...prev, emptyTraveler()]);
  const removeTraveler = (idx) =>
    setTravelers((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!travel) return "Invalid travel";
    for (const t of travelers) {
      if (!t.name?.trim()) return "Traveler name is required";
      const age = Number(t.age);
      if (!Number.isFinite(age) || age <= 0) return "Traveler age must be > 0";
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        travelId: travel.id,
        travelers: travelers.map((t) => ({
          name: t.name.trim(),
          age: Number(t.age),
        })),
        totalPrice,
      };
      await createBooking(payload);
      navigate("/travel/travels");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!travel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Book: {travel.title}
          </h1>
          <p className="text-gray-600">
            {travel.startDate} - {travel.endDate} • ${travel.price} per person
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {error && (
          <div className="bg-red-50 text-red-700 rounded px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-lg font-medium text-gray-900">Travelers</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add each traveler's name and age.
          </p>

          <div className="space-y-4">
            {travelers.map((t, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
              >
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) =>
                      setTravelerField(idx, "name", e.target.value)
                    }
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={t.age}
                    onChange={(e) =>
                      setTravelerField(idx, "age", e.target.value)
                    }
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  {travelers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTraveler(idx)}
                      className="w-full text-red-600 hover:text-red-800 border border-red-200 rounded-md py-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={addTraveler}
              className="text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-3 py-2"
            >
              + Add Traveler
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-700">Total Price</div>
            <div className="text-xl font-bold">${totalPrice}</div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TravelRegisterPage;
