/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe } from '../services/authService.js';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'revault_auth';

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	const clearSession = () => {
		localStorage.removeItem(AUTH_STORAGE_KEY);
		setUser(null);
		setToken(null);
	};

	const decodeJwtPayload = (jwt) => {
		try {
			if (!jwt || typeof jwt !== 'string') return null;
			const parts = jwt.split('.');
			if (parts.length < 2) return null;
			const base64Url = parts[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const padded = base64 + '==='.slice((base64.length + 3) % 4);
			const json = decodeURIComponent(
				atob(padded)
					.split('')
					.map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
					.join('')
			);
			return JSON.parse(json);
		} catch {
			return null;
		}
	};

	const isJwtExpired = (jwt) => {
		const payload = decodeJwtPayload(jwt);
		const exp = payload?.exp;
		if (typeof exp !== 'number') return false;
		return Date.now() >= exp * 1000;
	};

	useEffect(() => {
		let isMounted = true;

		const initialize = async () => {
			setLoading(true);
			const stored = localStorage.getItem(AUTH_STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					const storedUser = parsed.user || null;
					const storedToken = parsed.token || null;

					if (!storedToken || isJwtExpired(storedToken)) {
						if (isMounted) clearSession();
						if (isMounted) setLoading(false);
						return;
					}

					try {
						const me = await fetchMe();
						if (!isMounted) return;
						if (!me?.user) {
							clearSession();
							setLoading(false);
							return;
						}
						setUser(me.user || storedUser);
						setToken(storedToken);
					} catch (err) {
						if (isMounted) clearSession();
					}
				} catch (err) {
					if (isMounted) clearSession();
				}
			}
			if (isMounted) setLoading(false);
		};

		initialize();
		return () => {
			isMounted = false;
		};
	}, []);

	const login = (payload) => {
		const nextUser = payload?.user || null;
		const nextToken = payload?.token || null;
		if (!nextToken || isJwtExpired(nextToken)) {
			clearSession();
			return;
		}
		setUser(nextUser);
		setToken(nextToken);
		localStorage.setItem(
			AUTH_STORAGE_KEY,
			JSON.stringify({ user: nextUser, token: nextToken })
		);
	};

	const logout = () => {
		clearSession();
	};

	const value = useMemo(
		() => ({ user, token, loading, login, logout }),
		[user, token, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
