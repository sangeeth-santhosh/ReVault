import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService.js';

const AddInventory = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    expiry: '',
    condition: '',
  });
  const [images, setImages] = useState(Array(4).fill(null));
  const [previews, setPreviews] = useState(Array(4).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputsRef = useRef([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    setPreviews((prev) => {
      const next = [...prev];
      if (next[slotIndex]) URL.revokeObjectURL(next[slotIndex]);
      next[slotIndex] = URL.createObjectURL(firstImage);
      return next;
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next[index] = null;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    if (!form.name.trim()) {
      setError('Name is required');
      setSubmitting(false);
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      setSubmitting(false);
      return;
    }
    if (Number(form.quantity) < 0) {
      setError('Quantity must be zero or greater');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('quantity', Number(form.quantity) || 0);
      formData.append('expiry', form.expiry);
      formData.append('condition', form.condition);

      images.filter(Boolean).forEach((file) => {
        formData.append('images', file);
      });

      await inventoryService.add(formData);
      setMessage('Listing created successfully');
      setForm({
        name: '',
        description: '',
        category: '',
        quantity: '',
        expiry: '',
        condition: '',
      });
      images.forEach((file, idx) => {
        if (previews[idx]) URL.revokeObjectURL(previews[idx]);
      });
      setImages(Array(4).fill(null));
      setPreviews(Array(4).fill(null));
      setTimeout(() => navigate('/inventory/my'), 800);
    } catch (err) {
      setError(err?.message || 'Could not create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Add inventory</h1>
        <p className="text-sm text-gray-600">Create a new surplus listing with key specs.</p>
      </div>
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
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <input
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Expiry</label>
            <input
              name="expiry"
              type="date"
              value={form.expiry}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Condition</label>
            <input
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="e.g. Grade A"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Images (up to 4)</label>

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
                    <p className="text-sm font-medium text-gray-700">Slot {idx + 1}</p>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save listing'}
        </button>
      </form>
    </section>
  );
};

export default AddInventory;
