import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { register as registerService } from '../../services/authService.js';
import apiClient from '../../services/apiClient.js';

const LEGACY_PENDING_KEY = 'revault.registerRequest';
const REG_IDENTITY_KEY = 'revault.registrationIdentity';
const REG_STATUS_KEY = 'revault.registrationStatusByEmail';
const NOTIF_STORAGE_KEY = 'revault.notifications';

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

const pushNotification = (message) => {
  const notification = {
    message,
    createdAt: new Date().toISOString(),
    isRead: false,
    type: 'business_request',
  };

  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify([notification, ...list]));
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(
      new CustomEvent('revault:notification', {
        detail: notification,
      })
    );
  } catch {
    // ignore
  }
};

const readStatusByEmail = (email) => {
  try {
    const normalized = (email || '').toString().trim().toLowerCase();
    if (!normalized) return null;
    const raw = localStorage.getItem(REG_STATUS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const status = parsed[normalized];
    return status ? String(status) : null;
  } catch {
    return null;
  }
};

const writeStatusByEmail = (email, status) => {
  try {
    const normalized = (email || '').toString().trim().toLowerCase();
    if (!normalized) return;
    const raw = localStorage.getItem(REG_STATUS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = parsed && typeof parsed === 'object' ? { ...parsed } : {};
    next[normalized] = status;
    localStorage.setItem(REG_STATUS_KEY, JSON.stringify(next));
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
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requestStatus, setRequestStatus] = useState('none');
  const [appliedAt, setAppliedAt] = useState(null);
  const prevRequestStatusRef = useRef('none');

  const isPending = requestStatus === 'pending';

  const elapsed = formatElapsed(appliedAt);

  const applyBackendState = useCallback(({ status, appliedAt: backendAppliedAt }) => {
    const nextStatus = status === 'pending' ? 'pending' : 'none';

    // Button state is always backend-driven.
    setRequestStatus(nextStatus);
    setAppliedAt(nextStatus === 'pending' ? backendAppliedAt || null : null);

    // Effect safety: never reset while typing.
    // Only clear inputs when status transitions pending -> approved/rejected.
    if (prevRequestStatusRef.current === 'pending' && (status === 'approved' || status === 'rejected')) {
      setForm(EMPTY_FORM);
    }

    prevRequestStatusRef.current = nextStatus;
  }, []);

  const fetchRegistrationStatus = useCallback(async (email) => {
    const normalizedEmail = (email || '').toString().trim();
    if (!normalizedEmail) {
      return { exists: false, status: null, appliedAt: null };
    }
    return apiClient.get(`/auth/registration-status?email=${encodeURIComponent(normalizedEmail)}`);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const reconcile = async () => {
      // Safety: never allow stale local pending to lock the form.
      clearLegacyPending();

      // If already logged in, their status is canonical.
      const effectiveUserStatus = user?.status || null;
      if (effectiveUserStatus === 'pending') {
        applyBackendState({ status: 'pending', appliedAt: user?.appliedAt || null });
        return;
      }

      if (effectiveUserStatus === 'approved' || effectiveUserStatus === 'rejected') {
        applyBackendState({ status: effectiveUserStatus, appliedAt: null });
        return;
      }

      const storedIdentity = readIdentity();

      const email = (storedIdentity?.email || '').trim();
      if (!email) {
        applyBackendState({ status: null, appliedAt: null });
        return;
      }

      const normalizedEmail = email.toLowerCase();
      const previousStatus = readStatusByEmail(normalizedEmail);

      try {
        const statusRes = await fetchRegistrationStatus(email);
        if (!isMounted) return;

        const backendStatus = statusRes?.status ?? null;
        applyBackendState({ status: backendStatus, appliedAt: statusRes?.appliedAt || null });

        const nextKnownStatus = backendStatus ? String(backendStatus) : null;
        if (nextKnownStatus && nextKnownStatus !== previousStatus) {
          if (nextKnownStatus === 'approved') {
            if (previousStatus === 'deactivated') {
              pushNotification('Admin reactivated this business request. You can now login!');
            } else {
              pushNotification('Admin verified and approved this business request. You can now login!');
            }
          }
          if (nextKnownStatus === 'rejected') {
            pushNotification('Admin rejected this business request.');
          }
          if (nextKnownStatus === 'deactivated') {
            pushNotification('Admin deactivated this business request.');
          }
        }
        if (nextKnownStatus) writeStatusByEmail(normalizedEmail, nextKnownStatus);
      } catch {
        if (!isMounted) return;
        applyBackendState({ status: null, appliedAt: null });
      }
    };

    reconcile();
    return () => {
      isMounted = false;
    };
  }, [applyBackendState, fetchRegistrationStatus, user?.status, user?.appliedAt]);

  useEffect(() => {
    if (requestStatus !== 'pending') return;

    const storedIdentity = readIdentity();
    const email = (storedIdentity?.email || '').trim();
    if (!email) return;

    const normalizedEmail = email.toLowerCase();
    let cancelled = false;

    const tick = async () => {
      try {
        const statusRes = await fetchRegistrationStatus(email);
        if (cancelled) return;

        const backendStatus = statusRes?.status ?? null;
        applyBackendState({ status: backendStatus, appliedAt: statusRes?.appliedAt || null });

        const previousStatus = readStatusByEmail(normalizedEmail);
        const nextKnownStatus = backendStatus ? String(backendStatus) : null;

        if (nextKnownStatus && nextKnownStatus !== previousStatus) {
          if (nextKnownStatus === 'approved') {
            if (previousStatus === 'deactivated') {
              pushNotification('Admin reactivated this business request. You can now login!');
            } else {
              pushNotification('Admin verified and approved this business request. You can now login!');
            }
          }
          if (nextKnownStatus === 'rejected') pushNotification('Admin rejected this business request.');
          if (nextKnownStatus === 'deactivated') pushNotification('Admin deactivated this business request.');
          writeStatusByEmail(normalizedEmail, nextKnownStatus);
        }
      } catch {
        // ignore polling errors
      }
    };

    tick();
    const id = setInterval(tick, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [applyBackendState, fetchRegistrationStatus, requestStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'email' || name === 'phone') {
        writeIdentity({
          email: (next.email || '').trim(),
          phone: (next.phone || '').trim(),
        });
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting || isPending) return;

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

    writeIdentity({ email: payload.email, phone: payload.phone || '' });

    try {
      const res = await registerService(payload);
      if (!res?.success) {
        throw new Error('Unexpected response from server');
      }

      // Canonical: rebuild button state from backend status endpoint.
      const statusRes = await apiClient.get(
        `/auth/registration-status?email=${encodeURIComponent(payload.email)}`
      );
      const backendStatus = statusRes?.status ?? null;
      const nextStatus = backendStatus === 'pending' ? 'pending' : 'none';
      setRequestStatus(nextStatus);
      setAppliedAt(nextStatus === 'pending' ? statusRes?.appliedAt || null : null);
      prevRequestStatusRef.current = nextStatus;

      const normalizedEmail = (payload.email || '').toString().trim().toLowerCase();
      if (backendStatus) writeStatusByEmail(normalizedEmail, String(backendStatus));
      if (backendStatus === 'pending') {
        pushNotification('Business verification request sent to admin!');
      }
    } catch (err) {
      setRequestStatus('none');
      setAppliedAt(null);
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
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Pincode</label>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
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
