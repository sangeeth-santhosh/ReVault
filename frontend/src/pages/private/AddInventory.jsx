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
    image: '',
  });
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
      const payload = {
        title: form.name,
        description: form.description,
        category: form.category,
        quantity: Number(form.quantity) || 0,
        expiry: form.expiry,
        condition: form.condition,
        image: form.image,
      };
      await inventoryService.add(payload);
      setMessage('Listing created successfully');
      setForm({
        name: '',
        description: '',
        category: '',
        quantity: '',
        expiry: '',
        condition: '',
        image: '',
      });
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

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Image URL</label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            placeholder="https://..."
          />
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
