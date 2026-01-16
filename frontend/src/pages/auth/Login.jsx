import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { login as loginService } from '../../services/authService.js';

const REG_STATUS_KEY = 'revault.registrationStatusByEmail';

const pushNotification = (message) => {
  try {
    window.dispatchEvent(
      new CustomEvent('revault:notification', {
        detail: {
          message,
          createdAt: new Date().toISOString(),
          isRead: false,
        },
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

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const normalizedEmail = (email || '').toString().trim().toLowerCase();
    const previousStatus = readStatusByEmail(normalizedEmail);
    try {
      const res = await loginService({ email, password });
      if (res?.user && res?.token) {
        login({ user: res.user, token: res.token });

        if (previousStatus === 'pending') {
          pushNotification('Admin verified and approved this business request. You can now login!');
        }
        if (previousStatus === 'deactivated') {
          pushNotification('Admin reactivated this business request. You can now login!');
        }
        if (normalizedEmail) writeStatusByEmail(normalizedEmail, 'approved');

        const redirectTo = new URLSearchParams(location.search).get('redirect');
        navigate(redirectTo || '/browse-items');
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      const backendStatus = err?.data?.status;
      if (normalizedEmail && backendStatus) {
        writeStatusByEmail(normalizedEmail, String(backendStatus));
      }

      if (backendStatus === 'rejected') {
        pushNotification('Admin rejected this business request.');
      }
      if (backendStatus === 'deactivated') {
        pushNotification('Admin deactivated this business request.');
      }

      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-600">Access your dashboard to manage surplus inventory.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-gray-600">
          New here? <Link to="/register" className="font-semibold text-gray-900">Create an account</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;