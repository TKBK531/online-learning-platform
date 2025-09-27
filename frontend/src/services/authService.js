import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

class AuthService {
    async login(email, password) {
        try {
            console.log('🌐 AuthService: Making login request to backend for:', email);
            const response = await api.post('/users/login', { email, password });
            console.log('🌐 AuthService: Backend response received:', response.data);

            if (response.data.status === 'success') {
                const { tokens, user } = response.data.data;
                const token = tokens.access; // Extract access token from the tokens object
                console.log('✅ AuthService: Storing token and user data');
                console.log('👤 User data:', user);
                console.log('🎫 Token (first 10 chars):', token.substring(0, 10) + '...');

                Cookies.set('authToken', token, { expires: 7 });
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));

                console.log('💾 Storage verification:');
                console.log('Cookie token:', Cookies.get('authToken')?.substring(0, 10) + '...');
                console.log('LocalStorage token:', localStorage.getItem('authToken')?.substring(0, 10) + '...');

                return { success: true, user, token };
            }
            console.log('❌ AuthService: Backend returned failure:', response.data.message);
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('💥 AuthService: Login request failed:', error);
            console.error('Error details:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }

    async register(userData) {
        try {
            const response = await api.post('/users/register', userData);
            if (response.data.status === 'success') {
                return { success: true, message: 'Registration successful' };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    }

    async logout() {
        try {
            await api.post('/users/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('authToken');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    }

    getCurrentUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            return null;
        }
    }

    getToken() {
        return localStorage.getItem('authToken') || Cookies.get('authToken');
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    isInstructor() {
        return this.hasRole('instructor');
    }

    isStudent() {
        return this.hasRole('student');
    }
}

const authService = new AuthService();
export default authService;