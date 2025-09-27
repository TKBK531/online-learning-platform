import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = () => {
            try {
                const currentUser = authService.getCurrentUser();
                const token = authService.getToken();

                // Auth initialization

                if (currentUser && token) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                // Clear any corrupted data
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('🔐 AuthContext: Starting login process for:', email);
            const result = await authService.login(email, password);
            console.log('🔐 AuthContext: Login result received:', result);

            if (result.success) {
                console.log('✅ AuthContext: Login successful, setting user:', result.user);
                setUser(result.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            console.log('❌ AuthContext: Login failed:', result.message);
            return { success: false, message: result.message };
        } catch (error) {
            console.error('💥 AuthContext: Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            return await authService.register(userData);
        } catch (error) {
            return { success: false, message: 'Registration failed' };
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const hasRole = (role) => {
        return user && user.role === role;
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        hasRole,
        isAdmin: () => hasRole('admin'),
        isInstructor: () => hasRole('instructor'),
        isStudent: () => hasRole('student')
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};