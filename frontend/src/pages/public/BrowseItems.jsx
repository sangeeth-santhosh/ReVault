import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService.js';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await inventoryService.getAll();
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

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Browse surplus</h2>
        <p className="text-sm text-gray-600">Search and filter to find inventory that fits your specs.</p>
      </div>

      {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !items.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          No inventory published yet.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item._id || item.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{item.title || item.name}</h3>
            <p className="text-sm text-gray-600">
              Qty: {item.quantity ?? '—'} {item.unit || ''}
            </p>
            <p className="text-sm text-gray-500">{item.location || item.category || 'Category not set'}</p>
            <Link
              to={`/items/${item._id || item.id}`}
              className="mt-3 inline-block rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
            >
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BrowseItems;
