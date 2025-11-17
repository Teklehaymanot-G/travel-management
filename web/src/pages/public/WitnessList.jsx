import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicWitnesses } from "../../services/witnessService";

export default function WitnessList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPublicWitnesses({ page, limit, q });
      setItems(res?.data || []);
      setTotal(res?.pagination?.total || 0);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Witness</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button className="border px-4 py-2 rounded" onClick={load}>
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">No posts found</div>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <Link
              key={it.id}
              to={`/witnesses/${it.id}`}
              className="block p-4 bg-white rounded shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{it.title}</h2>
                <span className="text-sm text-gray-500">
                  {new Date(it.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                by {it?.author?.name || "Unknown"} • {it.commentsCount ?? 0}{" "}
                comments
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {page} of {pages} • {total} total
        </div>
        <div className="flex gap-2">
          <button
            className="border px-3 py-1 rounded"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="border px-3 py-1 rounded"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
