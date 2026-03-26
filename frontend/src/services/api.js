import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
	baseURL: API_URL,
});

// Automatyczne dodawanie tokenu do każdego requestu

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Token ${token}`;
	}
	return config;
});

export default api;

