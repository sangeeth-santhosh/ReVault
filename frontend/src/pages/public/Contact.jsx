import { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Thank you — we will reach out within one business day.');
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Contact</h1>
        <p className="text-sm text-gray-600">Tell us about your surplus program or integration needs.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-2 md:grid-cols-2">
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
            <label className="text-sm font-medium text-gray-700">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">What can we help with?</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            className="min-h-[120px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            required
          />
        </div>
        {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
        <button type="submit" className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800">
          Submit
        </button>
      </form>
    </section>
  );
};

export default Contact;
