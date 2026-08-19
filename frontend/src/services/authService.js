import axios from 'axios';
import { buildApiUrl, getApiHeaders } from '../config/api';

class AuthServices {
    async register(userData) {
        const response = await axios.post(buildApiUrl('/api/auth/register'), userData, {
            headers: getApiHeaders(null, { 'Content-Type': 'application/json' }),
            timeout: 15000,
        });
        return response.data;
    }

    async login(credentials) {
        // Clear any old user data first
        this.logout();
        
        const response = await axios.post(buildApiUrl('/api/auth/login'), credentials, {
            headers: getApiHeaders(null, { 'Content-Type': 'application/json' }),
            timeout: 15000,
        });
        if (response.data?.session_token) {
            localStorage.setItem('accessToken', response.data.session_token);
            localStorage.setItem('refreshToken', response.data.session_token);
            if (response.data?.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    }

    // Logout User & Clear Storage
    logout() {
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('user_name');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear any cached data by removing items that might contain user-specific data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('user') || key.includes('job') || key.includes('app') || key.includes('saved'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    // Get Current Authenticated User Details
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Request Password Reset Link
    async forgotPassword(email) {
        const response = await axios.post(buildApiUrl('/api/auth/forgot-password/'), { email });
        return response.data;
    }

    // Reset to New Password
    async resetPassword(uidb64, token, password, confirmPassword) {
        const response = await axios.post(buildApiUrl(`/api/auth/reset-password/${uidb64}/${token}/`), {
            password,
            confirm_password: confirmPassword
        });
        return response.data;
    }
}

export default new AuthServices();

