import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import inventoryService from "../../services/inventoryService.js";
import requestService from "../../services/requestService.js";
import useAuth from "../../hooks/useAuth.js";

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestingError, setRequestingError] = useState("");
  const [requestedQtyInput, setRequestedQtyInput] = useState("");
  const [userRequests, setUserRequests] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const itemRes = await inventoryService.getById(id);
      const data = itemRes?.data || null;
      setItem(data);
      setActiveImage(0);

      if (user) {
        const myReqRes = await requestService.getMine();
        const myRequests = myReqRes?.data || [];
        setUserRequests(myRequests);
      }
    } catch (err) {
      setError(err?.message || "Could not load item");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRequest = async (e) => {
    e?.preventDefault?.();
    if (!item?._id && !item?.id) return;

    setRequestingError("");
    setRequestMessage("");

    if (!String(requestedQtyInput).trim()) {
      setRequestingError("Quantity is required");
      return;
    }
    const requestedQty = Number(requestedQtyInput);
    const availableQty = Number(item?.quantity);
    if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
      setRequestingError("Quantity must be a positive number");
      return;
    }
    if (Number.isFinite(availableQty) && requestedQty > availableQty) {
      setRequestingError("Requested quantity exceeds available inventory");
      return;
    }

    setRequesting(true);
    try {
      await requestService.send({
        inventoryId: item._id || item.id,
        requestedQuantity: requestedQty,
        message: "Interested in this item",
      });
      setRequestMessage(
        "Request sent successfully. Check My Requests for updates.",
      );
      setRequestedQtyInput("");
      load();
    } catch (err) {
      setRequestingError(err?.message || "Could not send request");
    } finally {
      setRequesting(false);
    }
  };

  const isOwner =
    user &&
    item?.owner &&
    (user._id === item.owner._id || user._id === item.owner);
  const availableQty = Number(item?.quantity ?? 0);
  const unitLabel = item?.unit || "units";
  const userAlreadyRequested = userRequests.find(
    (r) => (r.inventory?._id || r.inventory) === (item?._id || item?.id),
  );

  const businessLocationText = useMemo(() => {
    const addr = item?.owner?.address;
    const street = addr?.street ? String(addr.street).trim() : "";
    const city = addr?.city ? String(addr.city).trim() : "";
    const state = addr?.state ? String(addr.state).trim() : "";
    const pincode = addr?.pincode ? String(addr.pincode).trim() : "";

    const leftParts = [street, city, state].filter(Boolean);
    const left = leftParts.join(", ");
    if (!left && !pincode) return "";
    if (left && pincode) return `${left} - ${pincode}`;
    return left || pincode;
  }, [item]);

  const mainImage = useMemo(() => {
    if (item?.images?.length) return item.images[activeImage] || item.images[0];
    return null;
  }, [item, activeImage]);

  return (
    <>
      {loading ? <div className=""></div> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && !item ? (
        <p className="text-sm text-gray-600">Item not found.</p>
      ) : null}
      <div>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {item ? (
            <div className="space-y-8">
              {/* Main Grid: Images + Details */}
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                {/* Images Section */}
                <div className="space-y-4">
                  <div className="w-full h-96 bg-white rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                        No image
                      </div>
                    )}
                  </div>
                  {item.images?.length ? (
                    <div className="flex gap-2">
                      {item.images.slice(0, 4).map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImage(idx)}
                          className={`w-20 h-20 rounded-2xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${
                            activeImage === idx
                              ? "border-gray-900"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`thumb-${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Details */}
                <div className="h-96 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">
                        {item.title}
                      </h1>
                      <p className="mt-1 text-xs text-gray-500">
                        Posted {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Category
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {item.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Condition
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {item.condition}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Available
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {availableQty} {unitLabel}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                        {item.description}
                      </p>
                    </div>

                    {item.owner && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Business
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {item.owner.businessName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {businessLocationText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom */}
                  <div className="space-y-3">
                    {availableQty === 0 ? (
                      <p className="text-sm -mt-20 text-amber-700">
                        This item is currently unavailable
                      </p>
                    ) : isOwner ? (
                      <p className="text-sm -mt-20 text-blue-700 border border-blue-200 rounded-xl px-3 py-2 max-w-[243px]">
                        You are the owner of this inventory
                      </p>
                    ) : !user ? (
                      <Link
                        to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                        className="block w-full rounded-xl bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        Login to Request
                      </Link>
                    ) : (
                      <form onSubmit={handleRequest} className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600">
                            Request Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={availableQty}
                            value={requestedQtyInput}
                            onChange={(e) =>
                              setRequestedQtyInput(e.target.value)
                            }
                            placeholder={`Maximum ${availableQty} ${unitLabel}`}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm placeholder:text-xs placeholder:font-medium placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
                          />
                        </div>

                        {requestingError && (
                          <p className="text-xs text-red-600">
                            {requestingError}
                          </p>
                        )}
                        {requestMessage && (
                          <p className="text-xs text-emerald-700">
                            {requestMessage}
                          </p>
                        )}

                        <button
                          disabled={requesting}
                          className="w-full bg-gray-900 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                        >
                          {requesting ? "Sending…" : "Send Request"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
};

export default ItemDetails;
