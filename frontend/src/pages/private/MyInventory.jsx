import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService.js';

const MyInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    setActionError('');
    try {
      const res = await inventoryService.getMine();
      setItems(res?.data || []);
    } catch (err) {
      setError(err?.message || 'Could not load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeItem = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await inventoryService.remove(id);
      await load();
    } catch (err) {
      setActionError(err?.message || 'Could not delete listing');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">My inventory</h1>
          <p className="text-sm text-gray-600">Track live listings and engagement.</p>
        </div>
        <Link to="/inventory/add" className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800">
          Add listing
        </Link>
      </div>

      {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

      {!loading && !items.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          No listings yet. Add your first inventory item to get requests.
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item._id || item.id}
            className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title || item.name}</h3>
              <p className="text-sm text-gray-600">Category: {item.category || '—'}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity ?? '—'} {item.unit || ''}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{item.status || 'Active'}</span>
              <Link
                to={`/inventory/update/${item._id || item.id}`}
                className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300"
              >
                Edit
              </Link>
              <Link
                to={`/requests/incoming?inventoryId=${item._id || item.id}`}
                className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300"
              >
                Requests
              </Link>
              <button
                onClick={() => removeItem(item._id || item.id)}
                className="rounded-md border border-gray-200 px-3 py-1 hover:border-gray-300"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyInventory;
