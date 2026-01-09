import { useEffect, useMemo, useState } from "react";
import apiClient from "../services/apiClient.js";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = useMemo(
    () => (value) => {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    },
    []
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/inventory/all");
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err?.message || "Could not load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory Monitor</h1>
          <p className="text-sm text-white/60 mt-1">Platform-wide inventory visibility (read-only).</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="h-[40px] px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {error ? <p className="text-sm text-red-400 mt-4">{error}</p> : null}

      <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-white/60 border-b border-white/10">
          <div className="col-span-3">Item Name</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Condition</div>
          <div className="col-span-1">Expiry</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Business</div>
        </div>

        {loading ? (
          <div className="px-6 py-6 text-sm text-white/60">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-6 text-sm text-white/60">No inventory published yet.</div>
        ) : (
          items.map((inv) => {
            const id = inv?._id || inv?.id;
            const name = inv?.title || inv?.name || "Item";
            const qty = Number.isFinite(inv?.quantity) ? inv.quantity : 0;
            const unit = inv?.unit || "units";
            const business = inv?.owner?.businessName || inv?.owner?.name || "—";
            const expiry = inv?.expiryDate || inv?.expiry;
            const displayStatus = qty === 0 ? "transferred" : (inv?.status || "available");

            return (
              <div key={id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/10 last:border-b-0">
                <div className="col-span-3 text-sm">{name}</div>
                <div className="col-span-2 text-sm text-white/70">{inv?.category || "—"}</div>
                <div className="col-span-2 text-sm text-white/70">{qty} {unit}</div>
                <div className="col-span-2 text-sm text-white/70">{inv?.condition || "—"}</div>
                <div className="col-span-1 text-sm text-white/70">{formatDate(expiry)}</div>
                <div className="col-span-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10 text-xs text-white/70">
                    {displayStatus}
                  </span>
                </div>
                <div className="col-span-1 text-sm text-white/70">{business}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
