import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(
		JSON.parse(localStorage.getItem('user')) || null
	);

	const login = async (username, password) => {
		const response = await api.post('/core/auth/login/', { username, password });
		const { token, user } = response.data;
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(user));
		setUser(user);
		return user;
	};

	const logout = async () => {
		await api.post('/core/auth/logout/');
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
