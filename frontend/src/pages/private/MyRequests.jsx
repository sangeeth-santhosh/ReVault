import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import requestService from '../../services/requestService.js';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await requestService.getMine();
      setRequests(res?.data || []);
    } catch (err) {
      setError(err?.message || 'Could not load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">My requests</h1>
        <p className="text-sm text-gray-600">Track the requests you sent to sellers.</p>
      </div>

      {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !requests.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          You have not sent any requests yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {requests.map((req) => (
          <article key={req._id || req.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">{req._id || req.id}</p>
                <h3 className="text-lg font-semibold text-gray-900">{req.inventory?.title || req.item || 'Requested item'}</h3>
                <p className="text-sm text-gray-600">Seller: {req.seller?.name || req.to || 'Seller'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{req.status || 'pending'}</span>
                <Link
                  to={`/chats?requestId=${req._id || req.id}`}
                  className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300"
                >
                  Open chat
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyRequests;
