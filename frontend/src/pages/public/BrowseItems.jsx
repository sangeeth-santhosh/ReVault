import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService.js';

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className="h-4 w-4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('Default sorting');

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

  const sortedItems = useMemo(() => {
    const list = [...items];
    switch (sortBy) {
      case 'Sort by price: low to high':
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'Sort by price: high to low':
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'Sort by newness':
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      default:
        return list;
    }
  }, [items, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="text-sm breadcrumbs mb-6 text-gray-500 flex items-center justify-between border-b pb-4">
          <span className="space-x-1">
            <Link to="/" className="hover:text-black">Home</Link>
            <span className="mx-1">/</span>
            <span className="font-medium text-black">Shop</span>
          </span>
          <div className="text-gray-700 text-xs flex items-center space-x-2">
            <span className="font-bold text-black border-2 border-black p-1 rounded-sm text-xs">GRID</span>
            <span className="text-gray-500 p-1 text-xs">LIST</span>
          </div>
        </div>

        {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!loading && !sortedItems.length ? (
          <p className="text-sm text-gray-600">No inventory published yet.</p>
        ) : null}

        <div className="grid grid-cols-1">
          <div>
            <div className="flex justify-between items-center text-sm mb-8">
              <p className="text-gray-600">Showing 1–{sortedItems.length} of {sortedItems.length || 0} results</p>
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-gray-700">Sort by:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm bg-white focus:ring-red-500 focus:border-red-500"
                >
                  <option>Default sorting</option>
                  <option>Sort by popularity</option>
                  <option>Sort by average rating</option>
                  <option>Sort by newness</option>
                  <option>Sort by price: low to high</option>
                  <option>Sort by price: high to low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
              {sortedItems.map((item) => {
                const imageSrc = item.images?.[0] || 'https://placehold.co/400x400/e5e7eb/ffffff?text=IMAGE';
                const name = item.title || item.name || 'Untitled item';
                const category = item.category || 'Uncategorized';
                const isSale = Boolean(item.onSale);
                return (
                  <div key={item._id || item.id} className="group relative">
                    {isSale ? (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase">Sale</span>
                      </div>
                    ) : null}
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-100 rounded-md">
                      <Link to={`/items/${item._id || item.id}`}>
                        <img
                          src={imageSrc}
                          alt={`${name} product image`}
                          className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                        />
                      </Link>
                    </div>
                    <div className="pt-2 text-left">
                      <p className="text-[10px] text-gray-500 mb-0.5">{category}</p>
                      <h3 className="text-sm font-medium text-gray-900 hover:text-red-500 transition-colors duration-200">
                        <Link to={`/items/${item._id || item.id}`}>
                          <span aria-hidden="true" className="absolute inset-0"></span>
                          {name}
                        </Link>
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-start items-center space-x-2 mt-12 pt-4 border-t">
              <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-white bg-red-500 rounded-full">1</span>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors">2</span>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRightIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
