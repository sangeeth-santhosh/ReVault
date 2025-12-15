import { useState } from 'react';
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
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

      images.forEach((file) => {
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
      setImages([]);
      setPreviews([]);
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
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 4);
              setImages(files);
              setPreviews(files.map((f) => URL.createObjectURL(f)));
            }}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border file:border-gray-200 file:bg-gray-50 file:px-3 file:py-1 file:text-sm"
          />
          {previews.length ? (
            <div className="flex flex-wrap gap-3">
              {previews.map((src, idx) => (
                <div key={src} className="relative h-20 w-20 overflow-hidden rounded-md border border-gray-200">
                  <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
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
