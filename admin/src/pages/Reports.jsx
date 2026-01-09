import { useState } from "react";
import { getAdminSession } from "../services/adminService.js";

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = (RAW_BASE_URL && String(RAW_BASE_URL).trim())
  ? String(RAW_BASE_URL).trim().replace(/\/+$/, "")
  : (import.meta.env.DEV ? "http://localhost:5000" : "");

const REPORTS = [
  {
    id: "inventory",
    title: "Inventory Posted",
    csvPath: "/admin/reports/inventory/csv",
    pdfPath: "/admin/reports/inventory/pdf",
  },
  {
    id: "completed",
    title: "Completed Transactions",
    csvPath: "/admin/reports/completed-transactions/csv",
    pdfPath: "/admin/reports/completed-transactions/pdf",
  },
  {
    id: "quantity",
    title: "Quantity Transferred",
    csvPath: "/admin/reports/quantity-transferred/csv",
    pdfPath: "/admin/reports/quantity-transferred/pdf",
  },
];

export default function Reports() {
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  const download = async (path, suggestedName) => {
    const { token } = getAdminSession();
    if (!token) return;
    if (!BASE_URL) {
      setError("VITE_API_BASE_URL is not set");
      return;
    }

    setError("");
    setDownloading(path);
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Download failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || "Could not download report");
    } finally {
      setDownloading("");
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-white/60 mt-1">Download platform reports (CSV / PDF).</p>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400 mt-4">{error}</p> : null}

      <div className="mt-6 grid gap-4">
        {REPORTS.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="text-sm text-white/60 mt-1">Download as CSV or PDF.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={downloading === r.csvPath}
                onClick={() => download(r.csvPath, `${r.id}.csv`)}
                className="h-[34px] px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 disabled:opacity-60"
              >
                {downloading === r.csvPath ? "Downloading…" : "Download CSV"}
              </button>
              <button
                type="button"
                disabled={downloading === r.pdfPath}
                onClick={() => download(r.pdfPath, `${r.id}.pdf`)}
                className="h-[34px] px-3 rounded-xl bg-white text-black text-xs font-semibold disabled:opacity-60"
              >
                {downloading === r.pdfPath ? "Downloading…" : "Download PDF"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
