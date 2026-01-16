import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
// import Promo from "../../components/Promo.jsx";
import inventoryService from "../../services/inventoryService.js";
import PaperPlane from "../../components/PaperPlanej.jsx";

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

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
    return [...items];
  }, [items]);

  const conditionFilter = (
    searchParams.get("condition") || "used"
  ).toLowerCase();

  const visibleItems = useMemo(() => {
    return sortedItems.filter((item) => {
      const condition = String(item?.condition ?? "").toLowerCase();
      return condition === conditionFilter;
    });
  }, [sortedItems, conditionFilter]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
          {/* Promo: visually large, logically partial */}
          {/* <div className="col-span-full">
            <Promo />
          </div> */}

          {loading ? (
            <div className="col-span-full">
              <div className="text-sm text-gray-600">
                <PaperPlane className="w-10 h-10" />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="col-span-full">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : null}

          {!loading && !visibleItems.length ? (
            <div className="col-span-full">
              <p className="text-sm text-gray-600">
                No inventory published yet.
              </p>
            </div>
          ) : null}

          {visibleItems.map((item) => {
            const imageSrc =
              item.images?.[0] ||
              "https://placehold.co/400x400/e5e7eb/ffffff?text=IMAGE";
            const name = item.title || item.name || "Untitled item";
            const category = item.category || "Uncategorized";
            const isSale = Boolean(item.onSale);

            return (
              <div key={item._id || item.id} className="group relative">
                <div className="w-45 h-48 overflow-hidden bg-gray-100 rounded-[35px] relative">
                  <Link to={`/items/${item._id || item.id}`}>
                    <img
                      src={imageSrc}
                      alt={`${name} product image`}
                      className="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                    />
                  </Link>

                  <div className="absolute top-4 left-5 right-5 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSale ? (
                        <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase">
                          Sale
                        </span>
                      ) : null}

                      <div className="flex gap-1 pointer-events-none">
                        <div className="w-3 h-3 rounded-full bg-pink-300"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"
                    >
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="#000000"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-left">
                  <p className="text-[10px] text-gray-500 mb-0.5">{category}</p>
                  <h3 className="text-sm font-medium text-gray-900 hover:text-red-500 transition-colors duration-200">
                    <Link to={`/items/${item._id || item.id}`}>{name}</Link>
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
