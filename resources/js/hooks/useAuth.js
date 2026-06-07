import { useState, useEffect } from 'react';
import axios from '../lib/axios';

export const useAuth = () => {
    const [user, setUser] = useState(() => {
        const cachedUser = localStorage.getItem('user_info');
        return cachedUser ? JSON.parse(cachedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(!user);

    const checkUser = async () => {
        try {
            const response = await axios.get('/api/user');
            setUser(response.data);
            localStorage.setItem('user_info', JSON.stringify(response.data));
            
            // Ensure activeRole is valid for current user
            const currentRoles = response.data.roles || [];
            const savedRole = localStorage.getItem('activeRole');
            
            if (!savedRole || !currentRoles.includes(savedRole)) {
                if (currentRoles.length > 0) {
                    localStorage.setItem('activeRole', currentRoles[0]);
                } else {
                    localStorage.removeItem('activeRole');
                }
            }
        } catch (error) {
            setUser(null);
            localStorage.removeItem('user_info');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async ({ email, password, setErrors }) => {
        setErrors({});
        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/login', { email, password });
            await checkUser();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ email: ['Terjadi kesalahan. Silakan coba lagi.'] });
            }
            throw error;
        }
    };

    const register = async ({ name, nip_nik, email, password, password_confirmation, setErrors }) => {
        setErrors({});
        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/register', { name, nip_nik, email, password, password_confirmation });
            await checkUser();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ email: ['Terjadi kesalahan. Silakan coba lagi.'] });
            }
            throw error;
        }
    };

    const logout = async () => {
        await axios.post('/logout');
        setUser(null);
        localStorage.removeItem('user_info');
        localStorage.removeItem('activeRole');
    };

    return { user, isLoading, login, register, logout };
};
