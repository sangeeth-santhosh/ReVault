import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import inventoryService from '../../services/inventoryService.js';
import requestService from '../../services/requestService.js';
import useAuth from '../../hooks/useAuth.js';

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestingError, setRequestingError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await inventoryService.getById(id);
      setItem(res?.data || null);
    } catch (err) {
      setError(err?.message || 'Could not load item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRequest = async () => {
    if (!user) return;
    if (!item?._id && !item?.id) return;
    setRequesting(true);
    setRequestMessage('');
    setRequestingError('');
    try {
      await requestService.send({ inventoryId: item._id || item.id, message: 'Interested in this item' });
      setRequestMessage('Request sent. Check My Requests for updates.');
    } catch (err) {
      setRequestingError(err?.message || 'Could not send request');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <section className="space-y-6">
      {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && !item ? (
        <p className="text-sm text-gray-600">Item not found.</p>
      ) : null}

      {item ? (
        <>
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase text-gray-500">Listing</p>
              <h1 className="text-3xl font-bold text-gray-900">{item.title || item.name}</h1>
              <p className="text-gray-600">{item.description || 'No description provided.'}</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="rounded-full bg-gray-100 px-3 py-1">Qty: {item.quantity ?? '—'} {item.unit || ''}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1">Location: {item.location || 'N/A'}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1">Category: {item.category || 'N/A'}</span>
                {item.condition ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1">Condition: {item.condition}</span>
                ) : null}
              </div>
            </div>
            <div className="w-full max-w-xs rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xl font-semibold text-gray-900">{item.price ? `$${item.price}` : 'Price on request'}</div>
              <p className="text-sm text-gray-600">Contact seller for pricing and availability.</p>
              {user ? (
                <button
                  onClick={handleRequest}
                  disabled={requesting}
                  className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {requesting ? 'Sending…' : 'Request item'}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="mt-4 block w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-white hover:bg-gray-800"
                >
                  Login to request
                </Link>
              )}
              {requestMessage ? <p className="mt-2 text-sm text-emerald-700">{requestMessage}</p> : null}
              {requestingError ? <p className="mt-2 text-sm text-red-600">{requestingError}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>• Category: {item.category || '—'}</li>
                <li>• Expiry: {item.expiry || '—'}</li>
                <li>• Condition: {item.condition || '—'}</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Seller notes</h3>
              <p className="mt-2 text-sm text-gray-600">{item.notes || item.description || 'No additional notes.'}</p>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default ItemDetails;
