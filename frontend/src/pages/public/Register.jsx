import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { register as registerService } from '../../services/authService.js';
import apiClient from '../../services/apiClient.js';

const LEGACY_PENDING_KEY = 'revault.registerRequest';
const REG_IDENTITY_KEY = 'revault.registrationIdentity';

const EMPTY_FORM = {
  businessName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
};

const readIdentity = () => {
  try {
    const raw = localStorage.getItem(REG_IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      email: (parsed.email || '').toString(),
      phone: (parsed.phone || '').toString(),
    };
  } catch {
    return null;
  }
};

const writeIdentity = ({ email, phone }) => {
  try {
    localStorage.setItem(REG_IDENTITY_KEY, JSON.stringify({ email, phone }));
  } catch {
    // ignore
  }
};

const clearLegacyPending = () => {
  try {
    localStorage.removeItem(LEGACY_PENDING_KEY);
  } catch {
    // ignore
  }
};

const formatElapsed = (appliedAt) => {
  if (!appliedAt) return '00:00';
  const start = new Date(appliedAt).getTime();
  if (!Number.isFinite(start)) return '00:00';
  const diffMs = Math.max(0, Date.now() - start);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requestStatus, setRequestStatus] = useState('none');
  const [appliedAt, setAppliedAt] = useState(null);

  const isPending = requestStatus === 'pending';

  const elapsed = useMemo(() => formatElapsed(appliedAt), [appliedAt]);

  useEffect(() => {
    let isMounted = true;

    const fullReset = () => {
      setRequestStatus('none');
      setAppliedAt(null);
      setForm(EMPTY_FORM);
    };

    const reconcile = async () => {
      // Safety: never allow stale local pending to lock the form.
      clearLegacyPending();

      // If already logged in, their status is canonical.
      const effectiveUserStatus = user?.status || null;
      if (effectiveUserStatus === 'pending') {
        setRequestStatus('pending');
        setAppliedAt(user?.appliedAt || null);
        setForm(EMPTY_FORM);
        return;
      }

      if (effectiveUserStatus === 'approved' || effectiveUserStatus === 'rejected') {
        fullReset();
        return;
      }

      const identity = readIdentity();
      if (!identity?.email && !identity?.phone) {
        fullReset();
        return;
      }

      try {
        const params = new URLSearchParams();
        if (identity.email) params.set('email', identity.email);
        if (identity.phone) params.set('phone', identity.phone);

        const statusRes = await apiClient.get(`/auth/registration-status?${params.toString()}`);
        if (!isMounted) return;

        const backendStatus = statusRes?.status ?? null;
        if (backendStatus === 'pending') {
          setRequestStatus('pending');
          setAppliedAt(statusRes?.appliedAt || null);
          setForm(EMPTY_FORM);
          return;
        }

        // Backend wins: not pending -> guaranteed reset.
        fullReset();
      } catch {
        if (!isMounted) return;
        fullReset();
      }
    };

    reconcile();
    return () => {
      isMounted = false;
    };
  }, [user?.status, user?.appliedAt]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting || isPending) return;

    setSubmitting(true);
    setError('');

    const prevForm = form;

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

    writeIdentity({ email: payload.email, phone: payload.phone || '' });

    try {
      const res = await registerService(payload);
      if (res?.success) {
        const nextStatus = res?.user?.status || null;
        if (nextStatus === 'pending') {
          setRequestStatus('pending');
          setAppliedAt(res?.user?.appliedAt || null);
          setForm(EMPTY_FORM);
        } else {
          setRequestStatus('none');
          setAppliedAt(null);
          setForm(EMPTY_FORM);
        }
      } else {
        setRequestStatus('none');
        setAppliedAt(null);
        setForm(prevForm);
        setError('Unexpected response from server');
      }
    } catch (err) {
      setRequestStatus('none');
      setAppliedAt(null);
      setForm(prevForm);
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
            disabled={isPending}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">User name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={isPending}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
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
            disabled={isPending}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Phone (optional)</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={isPending}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Street</label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
              placeholder="Address line"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Pincode</label>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
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
            disabled={isPending}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting || isPending}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <span className="flex w-full items-center justify-between">
              <span>Pending Verification</span>
              {appliedAt ? <span className="tabular-nums">{elapsed}</span> : <span />}
            </span>
          ) : (
            'Request'
          )}
        </button>
        {isPending ? (
          <p className="text-sm text-gray-600">You can request again after 24 hours if not approved or verified.</p>
        ) : null}
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-gray-900">Log in</Link>
        </p>
      </form>
    </section>
  );
};

export default Register;
