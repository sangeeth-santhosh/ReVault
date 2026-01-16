import { useEffect, useState } from 'react';
import requestService from '../../services/requestService.js';
import PaperPlane from '../../components/PaperPlanej.jsx';

const formatShortDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()] || '';
  const year = d.getFullYear();
  return month ? `${day} ${month} ${year}` : `${day} ${year}`;
};

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

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
    if (!id || actionId) return;
    setActionId(String(id));
    try {
      if (action === 'accept') await requestService.accept(id);
      if (action === 'reject') await requestService.reject(id);
      if (action === 'complete') await requestService.complete(id);
      await load();
    } catch (err) {
      setError(err?.message || 'Action failed');
    } finally {
      setActionId('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Incoming requests</h1>
        <p className="text-sm text-gray-600">Requests from buyers for your listings.</p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">
          <PaperPlane className="w-10 h-10" />
        </div>
      ) : null}
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
                <h3 className="text-lg font-semibold text-gray-900">{req.inventory?.title || req.inventory?.name || req.item || 'Inventory'}</h3>
                <p className="text-sm text-gray-600">From {req.buyer?.name || req.from || 'Buyer'}</p>
                <p className="text-sm text-gray-600">
                  {(() => {
                    const qtyRaw = req?.requestedQuantity ?? req?.quantity;
                    const qty = Number(qtyRaw);
                    const qtyText = Number.isFinite(qty) ? qty : '—';
                    const unit = req?.inventory?.unit || 'units';
                    const qtyWithUnit = qtyText === '—' ? '—' : `${qtyText} ${unit}`;
                    const dateText = formatShortDate(req?.createdAt || req?.requestedAt);
                    return `Requested: ${qtyWithUnit} · ${dateText}`;
                  })()}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{req.status || 'pending'}</span>
                {(req.status || 'pending') === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateStatus(req._id || req.id, 'accept')}
                      disabled={actionId === String(req._id || req.id)}
                      className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300 disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(req._id || req.id, 'reject')}
                      disabled={actionId === String(req._id || req.id)}
                      className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                ) : null}

                {(req.status || 'pending') === 'accepted' ? (
                  <button
                    onClick={() => updateStatus(req._id || req.id, 'complete')}
                    disabled={actionId === String(req._id || req.id)}
                    className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300 disabled:opacity-60"
                  >
                    Complete
                  </button>
                ) : null}
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
