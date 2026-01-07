import { useEffect, useMemo, useState } from "react";
import {
  approveBusiness,
  deactivateBusiness,
  fetchApprovedBusinesses,
  fetchPendingBusinesses,
  rejectBusiness,
} from "../services/adminService.js";

export default function Users() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(() => ({ pending: {}, approved: {} }));
  const [actionId, setActionId] = useState(null);

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

  const getStatus = (u) => {
    if (u?.status) return u.status;
    return "approved";
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetchPendingBusinesses(),
        fetchApprovedBusinesses(),
      ]);

      setPending(Array.isArray(pendingRes?.data) ? pendingRes.data : []);
      setApproved(Array.isArray(approvedRes?.data) ? approvedRes.data : []);
    } catch (err) {
      setError(err?.message || "Could not load businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpanded = (section, id) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: { ...prev[section], [id]: !prev?.[section]?.[id] },
    }));
  };

  const onApprove = async (id) => {
    setActionId(id);
    setError("");
    try {
      await approveBusiness(id);
      await load();
    } catch (err) {
      setError(err?.message || "Could not approve business");
    } finally {
      setActionId(null);
    }
  };

  const onReject = async (id) => {
    setActionId(id);
    setError("");
    try {
      await rejectBusiness(id);
      await load();
    } catch (err) {
      setError(err?.message || "Could not reject business");
    } finally {
      setActionId(null);
    }
  };

  const onDeactivate = async (id) => {
    setActionId(id);
    setError("");
    try {
      await deactivateBusiness(id);
      await load();
    } catch (err) {
      setError(err?.message || "Could not deactivate business");
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      {/* BUSINESS MANAGEMENT */}
      <div className="space-y-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Business Requests (Pending)</h2>
            <p className="text-sm text-white/60 mt-1">Businesses awaiting admin approval.</p>
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

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-white/60 border-b border-white/10">
            <div className="col-span-3">Business Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Applied Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {loading ? (
            <div className="px-6 py-6 text-sm text-white/60">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="px-6 py-6 text-sm text-white/60">No pending requests.</div>
          ) : (
            pending.map((u) => {
              const status = getStatus(u);
              const appliedDate = u?.appliedAt || u?.createdAt;
              const isExpanded = !!expanded?.pending?.[u._id];
              const isBusy = actionId === u._id;

              return (
                <div key={u._id} className="border-b border-white/10 last:border-b-0">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-3 text-sm">{u?.businessName || "—"}</div>
                    <div className="col-span-3 text-sm text-white/70">{u?.email || "—"}</div>
                    <div className="col-span-2 text-sm text-white/70">{formatDate(appliedDate)}</div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10 text-xs text-white/70">
                        {status}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpanded("pending", u._id)}
                        className="h-[34px] px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70"
                      >
                        {isExpanded ? "Hide" : "View"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(u._id)}
                        disabled={isBusy}
                        className="h-[34px] px-3 rounded-xl bg-white text-black text-xs font-semibold disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(u._id)}
                        disabled={isBusy}
                        className="h-[34px] px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="px-6 pb-5">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-white/60">Business Name</p>
                            <p className="mt-1">{u?.businessName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Email</p>
                            <p className="mt-1 text-white/70">{u?.email || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Phone</p>
                            <p className="mt-1 text-white/70">{u?.phone || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Applied Date</p>
                            <p className="mt-1 text-white/70">{formatDate(appliedDate)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-white/60">Address</p>
                            <p className="mt-1 text-white/70">
                              {u?.address?.street || "—"}
                              {u?.address?.city ? `, ${u.address.city}` : ""}
                              {u?.address?.state ? `, ${u.address.state}` : ""}
                              {u?.address?.pincode ? ` - ${u.address.pincode}` : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2" />

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Businesses (Approved)</h2>
            <p className="text-sm text-white/60 mt-1">Active businesses that can use the platform.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-white/60 border-b border-white/10">
            <div className="col-span-4">Business Name</div>
            <div className="col-span-3">Joined Date</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {loading ? (
            <div className="px-6 py-6 text-sm text-white/60">Loading…</div>
          ) : approved.length === 0 ? (
            <div className="px-6 py-6 text-sm text-white/60">No approved businesses.</div>
          ) : (
            approved.map((u) => {
              const status = getStatus(u);
              const joinedDate = u?.approvedAt || u?.createdAt;
              const isExpanded = !!expanded?.approved?.[u._id];
              const isBusy = actionId === u._id;
              const canDeactivate = status === "approved";
              const canReactivate = status === "deactivated" || status === "rejected";

              return (
                <div key={u._id} className="border-b border-white/10 last:border-b-0">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-4 text-sm">{u?.businessName || "—"}</div>
                    <div className="col-span-3 text-sm text-white/70">{formatDate(joinedDate)}</div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10 text-xs text-white/70">
                        {status}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpanded("approved", u._id)}
                        className="h-[34px] px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70"
                      >
                        {isExpanded ? "Hide" : "View"}
                      </button>
                      {canDeactivate ? (
                        <button
                          type="button"
                          onClick={() => onDeactivate(u._id)}
                          disabled={isBusy}
                          className="h-[34px] px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 disabled:opacity-60"
                        >
                          Deactivate
                        </button>
                      ) : null}

                      {canReactivate ? (
                        <button
                          type="button"
                          onClick={() => onApprove(u._id)}
                          disabled={isBusy}
                          className="h-[34px] px-3 rounded-xl bg-white text-black text-xs font-semibold disabled:opacity-60"
                        >
                          Reactivate
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="px-6 pb-5">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-white/60">Business Name</p>
                            <p className="mt-1">{u?.businessName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Email</p>
                            <p className="mt-1 text-white/70">{u?.email || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Phone</p>
                            <p className="mt-1 text-white/70">{u?.phone || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Joined Date</p>
                            <p className="mt-1 text-white/70">{formatDate(joinedDate)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-white/60">Address</p>
                            <p className="mt-1 text-white/70">
                              {u?.address?.street || "—"}
                              {u?.address?.city ? `, ${u.address.city}` : ""}
                              {u?.address?.state ? `, ${u.address.state}` : ""}
                              {u?.address?.pincode ? ` - ${u.address.pincode}` : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
