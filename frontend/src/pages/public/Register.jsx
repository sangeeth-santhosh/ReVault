import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { register as registerService } from '../../services/authService.js';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const address = {
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };
    const hasAddress = Object.values(address).some(Boolean);

    const payload = {
      businessName: form.businessName.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      ...(hasAddress ? { address } : {}),
    };

    try {
      const res = await registerService(payload);
      if (res?.user && res?.token) {
        login({ user: res.user, token: res.token });
        navigate('/dashboard');
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create your business account</h1>
        <p className="text-sm text-gray-600">Join ReVault to manage surplus inventory with your team.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Business name</label>
          <input
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Contact name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Work email</label>
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
          <label className="text-sm font-medium text-gray-700">Phone (optional)</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Street</label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Address line"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Pincode</label>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-gray-900">Log in</Link>
        </p>
      </form>
    </section>
  );
};

export default Register;
