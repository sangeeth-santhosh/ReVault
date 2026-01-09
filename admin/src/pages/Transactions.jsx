import { useEffect, useMemo, useState } from "react";
import apiClient from "../services/apiClient.js";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
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
      const res = await apiClient.get("/admin/transactions");
      setTransactions(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err?.message || "Could not load transactions");
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
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-white/60 mt-1">Completed transfers (read-only audit).</p>
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
          <div className="col-span-2">From</div>
          <div className="col-span-2">To</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Completed</div>
          <div className="col-span-1">Status</div>
        </div>

        {loading ? (
          <div className="px-6 py-6 text-sm text-white/60">Loading…</div>
        ) : transactions.length === 0 ? (
          <div className="px-6 py-6 text-sm text-white/60">No completed transactions yet.</div>
        ) : (
          transactions.map((tx) => {
            const id = tx?._id || tx?.id;
            const inv = tx?.request?.inventory;
            const itemName = inv?.title || inv?.name || "Item";
            const fromBiz = tx?.seller?.businessName || tx?.seller?.name || "—";
            const toBiz = tx?.buyer?.businessName || tx?.buyer?.name || "—";
            const unit = inv?.unit || "units";
            const qty = Number.isFinite(tx?.quantity) ? tx.quantity : (Number.isFinite(tx?.request?.quantity) ? tx.request.quantity : 0);
            const completed = tx?.updatedAt || tx?.createdAt;
            return (
              <div key={id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/10 last:border-b-0">
                <div className="col-span-3 text-sm">{itemName}</div>
                <div className="col-span-2 text-sm text-white/70">{fromBiz}</div>
                <div className="col-span-2 text-sm text-white/70">{toBiz}</div>
                <div className="col-span-2 text-sm text-white/70">{qty} {unit}</div>
                <div className="col-span-2 text-sm text-white/70">{formatDate(completed)}</div>
                <div className="col-span-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10 text-xs text-white/70">
                    {tx?.status || "completed"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
