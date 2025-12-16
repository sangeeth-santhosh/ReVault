import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import inventoryService from '../../services/inventoryService.js';
import requestService from '../../services/requestService.js';
import useAuth from '../../hooks/useAuth.js';

const AccordionItem = ({ title, content }) => (
  <details className="group border-b border-neutral-200 pb-3">
    <summary className="flex justify-between items-center cursor-pointer text-base font-semibold text-neutral-800 list-none">
      <span>{title}</span>
      <span className="group-open:rotate-180 transition-transform duration-200">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </summary>
    <p className="text-sm text-neutral-600 mt-2 pl-4">{content}</p>
  </details>
);

const SuggestionCard = ({ item }) => {
  const image = item.images?.[0];
  return (
    <Link to={`/items/${item._id || item.id}`} className="group cursor-pointer">
      <div className="aspect-[4/3] bg-neutral-100 rounded-xl mb-3 overflow-hidden group-hover:opacity-80 transition duration-300 flex items-center justify-center">
        {image ? (
          <img src={image} alt={item.title || item.name} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-700">
            Image
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-neutral-800 truncate">{item.title || item.name || 'Untitled item'}</p>
      <p className="text-sm text-neutral-500">{item.price ? `$${item.price}` : 'Price on request'}</p>
    </Link>
  );
};

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestingError, setRequestingError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [itemRes, allRes] = await Promise.all([
        inventoryService.getById(id),
        inventoryService.getAll(),
      ]);
      const data = itemRes?.data || null;
      setItem(data);
      setActiveImage(0);

      const allItems = allRes?.data || [];
      const filtered = allItems.filter((p) => (p._id || p.id) !== (data?._id || data?.id));
      setRelated(filtered.slice(0, 4));
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

  const mainImage = useMemo(() => {
    if (item?.images?.length) return item.images[activeImage] || item.images[0];
    return null;
  }, [item, activeImage]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading ? <p className="text-sm text-gray-600">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!loading && !item ? <p className="text-sm text-gray-600">Item not found.</p> : null}

        {item ? (
          <>
            <div className="lg:grid lg:grid-cols-2 lg:gap-16">
              <div className="mb-8 lg:mb-0">
                <div className="w-full bg-neutral-100 rounded-xl mb-4 overflow-hidden shadow-lg border border-neutral-200 aspect-[1/1] lg:aspect-[4/3] flex items-center justify-center">
                  {mainImage ? (
                    <img src={mainImage} alt={item.title || item.name} className="w-full h-full object-contain object-center" />
                  ) : (
                    <div className="p-16 w-full h-full flex items-center justify-center">
                      <div
                        className="w-11/12 h-11/12 bg-lime-700/70 rounded-xl flex items-center justify-center text-white text-xl font-extrabold shadow-2xl"
                        style={{ transform: 'rotateZ(-5deg)' }}
                      >
                        SHOE IMAGE
                      </div>
                    </div>
                  )}
                </div>

                {item.images?.length ? (
                  <div className="flex space-x-4">
                    {item.images.slice(0, 4).map((img, idx) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setActiveImage(idx)}
                        className={`w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden ${
                          activeImage === idx ? 'border-2 border-black' : 'border border-neutral-200'
                        }`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain object-center" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-neutral-100 border-2 border-black rounded-lg flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-lime-700/70"></div>
                    </div>
                    <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200 overflow-hidden">
                      <div className="w-full h-full bg-neutral-200/90"></div>
                    </div>
                    <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200 overflow-hidden">
                      <div className="w-full h-full bg-lime-700/90"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-extrabold mb-1">{item.title || item.name || 'Untitled item'}</h1>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full border border-neutral-200">{item.category || 'Category'}</span>
                  <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full border border-neutral-200">Qty: {item.quantity ?? '—'}</span>
                  <span className="bg-neutral-900 text-white px-3 py-1 rounded-full">{item.location || 'Location'}</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold">Product Description</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.description || 'No description provided.'}</p>
                </div>

                <div className="pt-6 space-y-4">
                  <AccordionItem
                    title="Shipping & Returns"
                    content={
                      item.shippingInfo ||
                      'Free shipping on all orders over $75. Returns are accepted within 30 days of purchase.'
                    }
                  />
                  <AccordionItem
                    title="Materials & Care"
                    content={
                      item.materials ||
                      'Upper made from premium materials and synthetic overlays. Wipe clean with a damp cloth.'
                    }
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="text-lg font-semibold text-neutral-900">{item.price ? `$${item.price}` : 'Price on request'}</div>
                  {user ? (
                    <button
                      onClick={handleRequest}
                      disabled={requesting}
                      className="rounded-full bg-neutral-900 px-4 py-2 text-white text-sm font-semibold hover:bg-neutral-800 disabled:opacity-60"
                    >
                      {requesting ? 'Sending…' : 'Request item'}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="rounded-full bg-neutral-900 px-4 py-2 text-white text-sm font-semibold hover:bg-neutral-800"
                    >
                      Login to request
                    </Link>
                  )}
                  {requestMessage ? <p className="text-sm text-emerald-700">{requestMessage}</p> : null}
                  {requestingError ? <p className="text-sm text-red-600">{requestingError}</p> : null}
                </div>
              </div>
            </div>

            <section className="mt-16 pt-12 border-t border-neutral-100">
              <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.length
                  ? related.map((p) => <SuggestionCard key={p._id || p.id} item={p} />)
                  : [1, 2, 3, 4].map((i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="aspect-[4/3] bg-neutral-100 rounded-xl mb-3 overflow-hidden group-hover:opacity-80 transition duration-300 flex items-center justify-center">
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-700">Placeholder</div>
                        </div>
                        <p className="text-sm font-semibold text-neutral-800 truncate">Suggested item</p>
                        <p className="text-sm text-neutral-500">—</p>
                      </div>
                    ))}
              </div>
            </section>
          </>
        ) : null}
      </main>

      <footer className="mt-12 py-6 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-neutral-500">
          &copy; 2025 Sepokat Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ItemDetails;
