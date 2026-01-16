import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import inventoryService from '../../services/inventoryService.js';
import PaperPlane from '../../components/PaperPlanej.jsx';

const DRAFT_STORAGE_KEY = 'revault_add_inventory_draft';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'medical', label: 'Medical' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'other', label: 'Other' },
];

const UNIT_OPTIONS = [
  { value: '', label: 'Unit' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'kg', label: 'Kg' },
  { value: 'liters', label: 'Liters' },
  { value: 'cartons', label: 'Cartons' },
];

const CONDITION_OPTIONS = [
  { value: '', label: 'Select condition' },
  { value: 'unused', label: 'Unused' },
  { value: 'used', label: 'Used' },
  { value: 'surplus', label: 'Surplus' },
];

const AddInventory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    unit: '',
    expiryDate: '',
    condition: '',
    location: '',
  });
  const [images, setImages] = useState(Array(4).fill(null));
  const [previews, setPreviews] = useState(Array(4).fill(null));
  const [keepImageUrls, setKeepImageUrls] = useState(Array(4).fill(null));
  const [loadingItem, setLoadingItem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const fileInputsRef = useRef([]);

  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form && typeof parsed.form === 'object') {
        const restored = { ...parsed.form };
        if (!restored.expiryDate && restored.expiry) {
          restored.expiryDate = restored.expiry;
        }
        setForm((prev) => ({ ...prev, ...restored }));
        setDraftSaved(true);
        setHasUnsavedChanges(false);
        setDraftNote('Draft restored');
      }
    } catch {
      // ignore corrupted drafts
    }
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const loadItem = async () => {
      setLoadingItem(true);
      setError('');
      try {
        const res = await inventoryService.getById(id);
        const item = res?.data;
        if (!item) {
          setError('Item not found');
          return;
        }

        const expiry = item?.expiryDate
          ? new Date(item.expiryDate).toISOString().slice(0, 10)
          : (item?.expiry || '');

        setForm({
          name: item?.name || item?.title || '',
          description: item?.description || '',
          category: item?.category || '',
          quantity: item?.quantity ?? '',
          unit: item?.unit || '',
          expiryDate: expiry,
          condition: item?.condition || '',
          location: item?.location || '',
        });

        const urls = Array.isArray(item?.images) ? item.images.slice(0, 4) : [];
        const nextKeep = Array(4).fill(null);
        const nextPreviews = Array(4).fill(null);
        urls.forEach((u, idx) => {
          nextKeep[idx] = u;
          nextPreviews[idx] = u;
        });

        setKeepImageUrls(nextKeep);
        setPreviews(nextPreviews);
        setImages(Array(4).fill(null));
        setDraftSaved(false);
        setHasUnsavedChanges(false);
        setDraftNote('');
      } catch (err) {
        setError(err?.message || 'Could not load item');
      } finally {
        setLoadingItem(false);
      }
    };

    loadItem();
  }, [id, isEdit]);

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.category) return 'Category is required';
    if (!form.description.trim()) return 'Description is required';
    const qty = Number(form.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return 'Quantity must be greater than 0';
    if (!form.unit) return 'Unit is required';
    if (!form.condition) return 'Condition is required';
    if (!form.expiryDate) return 'Expiry date is required';
    const expiry = new Date(form.expiryDate);
    if (Number.isNaN(expiry.getTime())) return 'Expiry date is invalid';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDay = new Date(expiry);
    expiryDay.setHours(0, 0, 0, 0);
    if (expiryDay < today) return 'Expiry date cannot be in the past';
    return '';
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftSaved(false);
    setHasUnsavedChanges(false);
    setDraftNote('');
  };

  const resetFormAndImages = () => {
    setForm({
      name: '',
      description: '',
      category: '',
      quantity: '',
      unit: '',
      expiryDate: '',
      condition: '',
      location: '',
    });
    previews.forEach((url) => {
      if (url && String(url).startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setImages(Array(4).fill(null));
    setPreviews(Array(4).fill(null));
    setKeepImageUrls(Array(4).fill(null));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (draftSaved) {
      setHasUnsavedChanges(true);
      setDraftNote('Unsaved changes');
    }
  };

  const handleSlotFiles = (fileList, slotIndex) => {
    if (!fileList) return;
    const firstImage = Array.from(fileList).find((file) => file.type.startsWith('image/'));
    if (!firstImage) return;

    setError('');

    setImages((prev) => {
      const next = [...prev];
      next[slotIndex] = firstImage;
      return next;
    });

    setKeepImageUrls((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      if (next[slotIndex] && String(next[slotIndex]).startsWith('blob:')) URL.revokeObjectURL(next[slotIndex]);
      next[slotIndex] = URL.createObjectURL(firstImage);
      return next;
    });

    if (draftSaved) {
      setHasUnsavedChanges(true);
      setDraftNote('Unsaved changes');
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setKeepImageUrls((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      if (next[index] && String(next[index]).startsWith('blob:')) URL.revokeObjectURL(next[index]);
      next[index] = null;
      return next;
    });

    if (draftSaved) {
      setHasUnsavedChanges(true);
      setDraftNote('Unsaved changes');
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          form,
          savedAt: new Date().toISOString(),
        })
      );
      setDraftSaved(true);
      setHasUnsavedChanges(false);
      setDraftNote('Saved as draft');
    } catch {
      setError('Could not save draft');
    }
  };

  const handleCancelDraft = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    clearDraft();
    resetFormAndImages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && (!draftSaved || hasUnsavedChanges)) {
      setError('Please save the draft before confirming');
      return;
    }
    setSubmitting(true);
    setMessage('');
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('title', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('quantity', Number(form.quantity) || 0);
      formData.append('unit', form.unit);
      formData.append('expiryDate', form.expiryDate);
      formData.append('condition', form.condition);
      if (form.location.trim()) {
        formData.append('location', form.location.trim());
      }

      if (isEdit) {
        const kept = keepImageUrls.filter(Boolean);
        formData.append('images', JSON.stringify(kept));
      }

      images.filter(Boolean).forEach((file) => {
        formData.append('images', file);
      });

      if (isEdit) {
        await inventoryService.update(id, formData);
        setMessage('Listing updated successfully');
        resetFormAndImages();
        setTimeout(() => navigate('/inventory/my'), 800);
      } else {
        await inventoryService.add(formData);
        setMessage('Listing created successfully');
        clearDraft();
        resetFormAndImages();
        setTimeout(() => navigate('/inventory/my'), 800);
      }
    } catch (err) {
      setError(err?.message || (isEdit ? 'Could not update listing' : 'Could not create listing'));
    } finally {
      setSubmitting(false);
    }
  };

  const canConfirm = isEdit ? true : (draftSaved && !hasUnsavedChanges);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit inventory' : 'Add inventory'}</h1>
        <p className="text-sm text-gray-600">{isEdit ? 'Update your listing details.' : 'Create a new surplus listing with key specs.'}</p>
      </div>
      {loadingItem ? (
        <div className="text-sm text-gray-600">
          <PaperPlane className="" />
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              required
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value || 'empty'} value={opt.value} disabled={opt.value === ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Location (optional)</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            placeholder="e.g. Warehouse A"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                required
              />
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                required
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value} disabled={opt.value === ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Expiry date</label>
            <input
              name="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              required
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value || 'empty'} value={opt.value} disabled={opt.value === ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Images</label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-emerald-500 hover:bg-emerald-50/60"
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleSlotFiles(e.dataTransfer.files, idx);
                }}
                onClick={() => fileInputsRef.current[idx]?.click()}
              >
                {previews[idx] ? (
                  <>
                    <img src={previews[idx]} alt={`preview-${idx}`} className="h-full w-full object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-xs text-gray-600 shadow hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove image"
                    >
                      ❌
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-medium text-gray-700">Image {idx + 1}</p>
                    <p className="text-xs text-gray-500">Drag & drop or click</p>
                  </div>
                )}

                <input
                  ref={(el) => (fileInputsRef.current[idx] = el)}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleSlotFiles(e.target.files, idx);
                    e.target.value = '';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="min-h-[140px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {draftNote ? <p className="text-sm text-gray-600">{draftNote}</p> : null}

        <button
          type={canConfirm ? 'submit' : 'button'}
          onClick={canConfirm ? undefined : handleSaveDraft}
          disabled={submitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : canConfirm ? 'Confirm listing' : 'Save listing'}
        </button>

        {draftSaved ? (
          <button
            type="button"
            onClick={handleCancelDraft}
            disabled={submitting}
            className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-900 hover:border-gray-300 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </form>
    </section>
  );
};

export default AddInventory;
