import { useEffect, useState } from 'react';
import requestService from '../../services/requestService.js';

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await requestService.getIncoming();
      setRequests(res?.data || []);
    } catch (err) {
      setError(err?.message || 'Could not load incoming requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      if (action === 'accept') await requestService.accept(id);
      if (action === 'reject') await requestService.reject(id);
      if (action === 'complete') await requestService.complete(id);
      await load();
    } catch (err) {
      setError(err?.message || 'Action failed');
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Incoming requests</h1>
        <p className="text-sm text-gray-600">Requests from buyers for your listings.</p>
      </div>

      {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !requests.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          No incoming requests yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {requests.map((req) => (
          <article key={req._id || req.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{req.inventory?.title || req.item || 'Inventory'}</h3>
                <p className="text-sm text-gray-600">From {req.buyer?.name || req.from || 'Buyer'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{req.status || 'pending'}</span>
                <button
                  onClick={() => updateStatus(req._id || req.id, 'accept')}
                  disabled={(req.status || 'pending') !== 'pending'}
                  className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(req._id || req.id, 'reject')}
                  disabled={(req.status || 'pending') !== 'pending'}
                  className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus(req._id || req.id, 'complete')}
                  disabled={(req.status || 'pending') !== 'accepted'}
                  className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300"
                >
                  Complete
                </button>
              </div>
            </div>
            {['accepted', 'completed'].includes(req.status) ? null : (
              <p className="mt-2 text-xs text-gray-600">Chat available after request is accepted</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default IncomingRequests;
