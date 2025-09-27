import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({
    children,
    requireAuth = true,
    allowedRoles = [],
    redirectTo = '/login'
}) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If user is authenticated but accessing login/register pages
    if (!requireAuth && isAuthenticated) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    // If specific roles are required
    if (requireAuth && allowedRoles.length > 0 && user) {
        const hasRequiredRole = allowedRoles.includes(user.role);
        if (!hasRequiredRole) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">You don't have permission to access this page.</p>
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;