import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import inventoryService from '../../services/inventoryService.js';
import requestService from '../../services/requestService.js';
import transactionService from '../../services/transactionService.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ listings: 0, incoming: 0, outgoing: 0, completed: 0 });
  const [activity, setActivity] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, incRes, outRes, txBuyerRes, txSellerRes] = await Promise.all([
        inventoryService.getMine(),
        requestService.getIncoming(),
        requestService.getMine(),
        transactionService.getMy(),
        transactionService.getSeller(),
      ]);

      const listings = invRes?.data || [];
      const incoming = incRes?.data || [];
      const outgoing = outRes?.data || [];
      const txCombined = [...(txBuyerRes?.data || []), ...(txSellerRes?.data || [])];
      const transactions = txCombined.filter(
        (tx, idx, arr) => arr.findIndex((t) => (t._id || t.id) === (tx._id || tx.id)) === idx
      );
      const completed = transactions.filter((t) => t.status === 'completed');

      setStats({
        listings: listings.length,
        incoming: incoming.length,
        outgoing: outgoing.length,
        completed: completed.length,
      });

      const recentRequests = incoming.slice(0, 3).map((r) => ({
        type: 'request',
        id: r._id || r.id,
        title: r.inventory?.title || 'Request',
        detail: r.status || 'pending',
      }));
      const recentListings = listings.slice(0, 3).map((l) => ({
        type: 'listing',
        id: l._id || l.id,
        title: l.title || l.name,
        detail: l.category || 'Listing',
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
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your surplus pipeline.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600">
          {user?.name ? `Signed in as ${user.name}` : 'Signed in user'}
          {user?.email ? ` • ${user.email}` : ''}
        </p>
        {loading ? <p className="text-sm text-gray-600">Loading overview…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-2xl font-semibold text-gray-900">{loading ? '—' : s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Recent activity</h3>
          {loading ? <p className="mt-2 text-sm text-gray-600">Loading…</p> : null}
          {!loading && !activity.length ? (
            <p className="mt-2 text-sm text-gray-600">No recent activity yet.</p>
          ) : null}
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            {activity.map((a) => (
              <div key={a.id} className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="text-xs uppercase text-gray-500">{a.type}</div>
                <div className="font-semibold text-gray-900">{a.title}</div>
                <div className="text-xs text-gray-600">{a.detail}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Next steps</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>• Add a new listing with clear specs and photos.</p>
            <p>• Review incoming requests and respond within SLA.</p>
            <p>• Mark completed deals to track fulfillment.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
