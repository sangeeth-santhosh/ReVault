import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe } from '../services/authService.js';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'revault_auth';

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const initialize = async () => {
			setLoading(true);
			const stored = localStorage.getItem(AUTH_STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					setUser(parsed.user || null);
					setToken(parsed.token || null);

					try {
						const me = await fetchMe();
						if (isMounted && me?.user) {
							setUser(me.user);
						}
					} catch (err) {
						console.warn('Session validation failed', err);
						localStorage.removeItem(AUTH_STORAGE_KEY);
						if (isMounted) {
							setUser(null);
							setToken(null);
						}
					}
				} catch (err) {
					console.warn('Invalid auth storage, clearing', err);
					localStorage.removeItem(AUTH_STORAGE_KEY);
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
		setUser(nextUser);
		setToken(nextToken);
		localStorage.setItem(
			AUTH_STORAGE_KEY,
			JSON.stringify({ user: nextUser, token: nextToken })
		);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem(AUTH_STORAGE_KEY);
	};

	const value = useMemo(
		() => ({ user, token, loading, login, logout }),
		[user, token, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
