import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import inventoryService from '../../services/inventoryService.js';
import requestService from '../../services/requestService.js';
import transactionService from '../../services/transactionService.js';
import reportService from '../../services/reportService.js';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ listings: 0, incoming: 0, outgoing: 0, completed: 0 });
  const [activity, setActivity] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, incRes, outRes, txBuyerRes, txSellerRes, reportsSummary] = await Promise.all([
        inventoryService.getMine(),
        requestService.getIncoming(),
        requestService.getMine(),
        transactionService.getMy(),
        transactionService.getSeller(),
        reportService.getSummary(),
      ]);

      const listings = invRes?.data || [];
      const incoming = incRes?.data || [];
      const outgoing = outRes?.data || [];
      const txCombined = [...(txBuyerRes?.data || []), ...(txSellerRes?.data || [])];
      const transactions = txCombined.filter(
        (tx, idx, arr) => arr.findIndex((t) => (t._id || t.id) === (tx._id || tx.id)) === idx
      );
      const completed = transactions.filter((t) => t.status === 'completed');
      const summaryData = reportsSummary?.data || {};

      setStats({
        listings: summaryData.totalInventoryPosted ?? listings.length,
        incoming: incoming.length,
        outgoing: outgoing.length,
        completed: summaryData.totalCompletedTransactions ?? completed.length,
      });

      const recentRequests = incoming.slice(0, 3).map((r) => ({
        type: 'request',
        id: r._id || r.id,
        title: r.inventory?.title || 'Request',
        detail: r.status || 'pending',
        image: r.inventory?.images?.[0],
      }));
      const recentListings = listings.slice(0, 3).map((l) => ({
        type: 'listing',
        id: l._id || l.id,
        title: l.title || l.name,
        detail: l.category || 'Listing',
        image: l.images?.[0],
      }));
      const recentTx = transactions.slice(0, 3).map((t) => ({
        type: 'transaction',
        id: t._id || t.id,
        title: t.request?.inventory?.title || t.item || 'Transaction',
        detail: t.status || 'status',
      }));

      const recentOutgoing = outgoing.slice(0, 3).map((r) => ({
        type: 'request-out',
        id: r._id || r.id,
        title: r.inventory?.title || 'Request',
        detail: r.status || 'pending',
      }));

      setActivity([...recentRequests, ...recentOutgoing, ...recentListings, ...recentTx].slice(0, 5));
    } catch (err) {
      setError(err?.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    { label: 'Active listings', value: stats.listings },
    { label: 'Incoming requests', value: stats.incoming },
    { label: 'Outgoing requests', value: stats.outgoing },
    { label: 'Completed transactions', value: stats.completed },
    { label: 'Fulfillment rate', value: stats.listings ? `${Math.round((stats.completed / stats.listings) * 100) || 0}%` : '0%' },
  ];

  return (
    <section className="space-y-8">
      {/* Removed page title and subtitle */}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Welcome back</h2>
              <p className="mt-1 text-sm text-gray-600">
                {user?.name ? `Signed in as ${user.name}` : 'Signed in user'}
                {user?.email ? ` • ${user.email}` : ''}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              {loading ? 'Syncing data…' : 'Up to date'}
            </div>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-2">Fulfillment rate</p>
          <div className="text-3xl font-bold text-gray-900">{loading ? '—' : cards.find((c) => c.label === 'Fulfillment rate')?.value}</div>
          <p className="text-xs text-gray-500 mt-1">Based on completed transactions vs active listings</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards
          .filter((c) => c.label !== 'Fulfillment rate')
          .map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-2"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{s.label}</div>
              <div className="text-3xl font-bold text-gray-900">{loading ? '—' : s.value}</div>
            </div>
          ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent activity</h3>
            <span className="text-xs text-gray-500">Last 5 updates</span>
          </div>
          {loading ? (
            <div className="mt-3 text-sm text-gray-600"></div>
          ) : null}
          {!loading && !activity.length ? (
            <p className="mt-3 text-sm text-gray-600">No recent activity yet.</p>
          ) : null}
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            {activity.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                {a.image ? (
                  <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200">
                    <img src={a.image} alt={a.title} className="h-full w-full object-cover object-center" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-md border border-gray-200 bg-white grid place-items-center text-xs text-gray-400">
                    {a.type}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase text-gray-500">{a.type}</div>
                  <div className="font-semibold text-gray-900 truncate">{a.title}</div>
                  <div className="text-xs text-gray-600">{a.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Next steps</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">Add a new listing with clear specs and photos.</div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">Review incoming requests and respond within SLA.</div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">Mark completed deals to track fulfillment.</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;
