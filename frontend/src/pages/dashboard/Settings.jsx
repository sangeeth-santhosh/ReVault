import { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }

    // Placeholder: wire to profile update API when available
    setMessage('Profile updated locally');
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">Manage account, notifications, and security.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Name"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Email"
              type="email"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4" />
            Deal updates
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4" />
            Messages
          </label>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          <button type="button" className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300">
            Update password
          </button>
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800">
          Save profile
        </button>
      </form>
    </section>
  );
};

export default Settings;
