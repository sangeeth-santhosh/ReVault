import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Promo from "../../components/Promo.jsx";
import inventoryService from "../../services/inventoryService.js";

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("Default sorting");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inventoryService.getAll();
      setItems(res?.data || []);
    } catch (err) {
      setError(err?.message || "Could not load inventory");
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
      case "Sort by price: low to high":
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "Sort by price: high to low":
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "Sort by newness":
        return list.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      default:
        return list;
    }
  }, [items, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <Promo />
        {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!loading && !sortedItems.length ? (
          <p className="text-sm text-gray-600">No inventory published yet.</p>
        ) : null}

        <div className="grid grid-cols-1">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
              {sortedItems.map((item) => {
                const imageSrc =
                  item.images?.[0] ||
                  "https://placehold.co/400x400/e5e7eb/ffffff?text=IMAGE";
                const name = item.title || item.name || "Untitled item";
                const category = item.category || "Uncategorized";
                const isSale = Boolean(item.onSale);
                return (
                  <div key={item._id || item.id} className="group relative">
                    {isSale ? (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase">
                          Sale
                        </span>
                      </div>
                    ) : null}
                    <div className="w-full h-48 overflow-hidden bg-gray-100 rounded-md">
                      <Link to={`/items/${item._id || item.id}`}>
                        <img
                          src={imageSrc}
                          alt={`${name} product image`}
                          className="w-full h-full object-cover object-center rounded-md group-hover:opacity-75 transition-opacity duration-300"
                        />
                      </Link>
                    </div>
                    <div className="pt-2 text-left">
                      <p className="text-[10px] text-gray-500 mb-0.5">
                        {category}
                      </p>
                      <h3 className="text-sm font-medium text-gray-900 hover:text-red-500 transition-colors duration-200">
                        <Link to={`/items/${item._id || item.id}`}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          ></span>
                          {name}
                        </Link>
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
