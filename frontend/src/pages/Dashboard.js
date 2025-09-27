import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import api from '../services/api';
import Cookies from 'js-cookie';


const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'instructor':
                return 'bg-blue-100 text-blue-800';
            case 'student':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const AdminDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                            📊 Platform Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Users:</span>
                                <span className="font-medium">1,234</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Active Courses:</span>
                                <span className="font-medium">56</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Monthly Revenue:</span>
                                <span className="font-medium">$12,350</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-purple-800 flex items-center gap-2">
                            🤖 AI Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">GPT Requests:</span>
                                <span className="font-medium">2,156</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Gemini Requests:</span>
                                <span className="font-medium">1,843</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Cost:</span>
                                <span className="font-medium">$89.32</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
                            ⚡ System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Server Status:</span>
                                <Badge className="bg-green-100 text-green-800">Online</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Database:</span>
                                <Badge className="bg-green-100 text-green-800">Connected</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">AI Services:</span>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-r from-slate-50 to-gray-100 border-gray-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        ⚙️ Quick Actions
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                        Administrative tools and management options
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            variant="outline"
                            className="h-12 font-medium hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            onClick={() => navigate('/courses')}
                        >
                            📚 View Courses
                        </Button>
                        <Button variant="outline" className="h-12 font-medium hover:bg-green-50 hover:border-green-300 transition-colors">📈 Course Analytics</Button>
                        <Button variant="outline" className="h-12 font-medium hover:bg-yellow-50 hover:border-yellow-300 transition-colors">📋 System Logs</Button>
                        <Button variant="outline" className="h-12 font-medium hover:bg-purple-50 hover:border-purple-300 transition-colors">⚙️ Settings</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const InstructorDashboard = () => {
        const [dashboardStats, setDashboardStats] = useState({
            publishedCourses: 0,
            draftCourses: 0,
            totalStudents: 0,
            thisMonthEnrollments: 0
        });
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            // Only fetch stats if user is authenticated and is an instructor
            if (user && user.role === 'instructor') {
                // Add a small delay to ensure token is properly set
                const timer = setTimeout(() => {
                    fetchDashboardStats();
                }, 100);
                return () => clearTimeout(timer);
            } else {
                setLoading(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [user]);

        const fetchDashboardStats = async () => {
            try {
                console.log('📊 Instructor Dashboard: Fetching stats for user:', user?.name, user?.role);
                console.log('🎫 Current tokens:');
                console.log('- Cookie:', Cookies.get('authToken')?.substring(0, 10) + '...');
                console.log('- LocalStorage:', localStorage.getItem('authToken')?.substring(0, 10) + '...');

                const response = await api.get('/instructor/dashboard/stats');
                console.log('📊 Instructor Dashboard: Stats response received:', response.data);

                if (response.data.status === 'success') {
                    console.log('✅ Instructor Dashboard: Setting stats data:', response.data.data);
                    setDashboardStats(response.data.data);
                } else {
                    console.log('⚠️ Instructor Dashboard: Backend returned non-success status:', response.data);
                }
            } catch (error) {
                console.error('💥 Instructor Dashboard: Error fetching stats:', error);
                console.error('Error details:', error.response?.data);
                console.error('Error status:', error.response?.status);

                // Don't crash the component if the API call fails
                // Just use default/empty data
                setDashboardStats({
                    publishedCourses: 0,
                    draftCourses: 0,
                    totalStudents: 0,
                    thisMonthEnrollments: 0
                });
            } finally {
                setLoading(false);
            }
        };

        if (loading) {
            return (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="pb-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Published Courses Card */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                📚 Published Courses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-blue-900 mb-2">
                                {dashboardStats.publishedCourses}
                            </div>
                            <p className="text-sm text-blue-600">Live courses</p>
                        </CardContent>
                    </Card>

                    {/* Draft Courses Card */}
                    <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                                📝 Draft Courses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-orange-900 mb-2">
                                {dashboardStats.draftCourses}
                            </div>
                            <p className="text-sm text-orange-600">In development</p>
                        </CardContent>
                    </Card>

                    {/* Total Students Card */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                                👥 Total Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-green-900 mb-2">
                                {dashboardStats.totalStudents}
                            </div>
                            <p className="text-sm text-green-600">Enrolled students</p>
                        </CardContent>
                    </Card>

                    {/* This Month Enrollments Card */}
                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                                📈 New Enrollments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-purple-900 mb-2">
                                {dashboardStats.thisMonthEnrollments}
                            </div>
                            <p className="text-sm text-purple-600">This month</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-gradient-to-r from-emerald-50 to-teal-100 border-emerald-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-emerald-800 flex items-center gap-2">
                            📖 Course Management
                        </CardTitle>
                        <CardDescription className="text-emerald-600 text-base">
                            Create and manage your educational content
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                className="h-12 font-medium bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                onClick={() => navigate('/courses')}
                            >
                                📚 Manage Courses
                            </Button>
                            <Button variant="outline" className="h-12 font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-colors">📊 Course Analytics</Button>
                            <Button variant="outline" className="h-12 font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-colors">💬 Student Messages</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-violet-50 to-purple-100 border-violet-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-violet-800 flex items-center gap-2">
                            🎨 AI Content Tools
                        </CardTitle>
                        <CardDescription className="text-violet-600 text-base">
                            Use AI to enhance your course creation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-12 font-medium hover:bg-violet-50 hover:border-violet-300 transition-colors">🧠 GPT Course Assistant</Button>
                            <Button variant="outline" className="h-12 font-medium hover:bg-violet-50 hover:border-violet-300 transition-colors">✨ Gemini Content Generator</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const StudentDashboard = () => {
        const [dashboardStats, setDashboardStats] = useState({
            enrolledCourses: 0,
            completedCourses: 0,
            overallProgress: 0,
            upcomingActivities: 0
        });
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            // Only fetch stats if user is authenticated and is a student
            if (user && user.role === 'student') {
                // Add a small delay to ensure token is properly set
                const timer = setTimeout(() => {
                    fetchDashboardStats();
                }, 100);
                return () => clearTimeout(timer);
            } else {
                setLoading(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [user]);

        const fetchDashboardStats = async () => {
            try {
                console.log('📊 Dashboard: Fetching stats for user:', user?.name, user?.role);
                console.log('🎫 Current tokens:');
                console.log('- Cookie:', Cookies.get('authToken')?.substring(0, 10) + '...');
                console.log('- LocalStorage:', localStorage.getItem('authToken')?.substring(0, 10) + '...');

                const response = await api.get('/student/dashboard/stats');
                console.log('📊 Dashboard: Stats response received:', response.data);

                if (response.data.status === 'success') {
                    console.log('✅ Dashboard: Setting stats data:', response.data.data);
                    setDashboardStats(response.data.data);
                } else {
                    console.log('⚠️ Dashboard: Backend returned non-success status:', response.data);
                }
            } catch (error) {
                console.error('💥 Dashboard: Error fetching stats:', error);
                console.error('Error details:', error.response?.data);
                console.error('Error status:', error.response?.status);

                // Don't crash the component if the API call fails
                // Just use default/empty data
                setDashboardStats({
                    enrolledCourses: 0,
                    completedCourses: 0,
                    overallProgress: 0,
                    upcomingActivities: 5
                });
            } finally {
                setLoading(false);
            }
        };

        if (loading) {
            return (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="pb-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Enrolled Courses Card */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                📚 Enrolled Courses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-blue-900 mb-2">
                                {dashboardStats.enrolledCourses}
                            </div>
                            <p className="text-sm text-blue-600">Active enrollments</p>
                        </CardContent>
                    </Card>

                    {/* Completed Courses Card */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                                ✅ Completed Courses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-green-900 mb-2">
                                {dashboardStats.completedCourses}
                            </div>
                            <p className="text-sm text-green-600">Successfully finished</p>
                        </CardContent>
                    </Card>

                    {/* Overall Progress Card */}
                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                                📊 Overall Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-purple-900 mb-2">
                                {dashboardStats.overallProgress}%
                            </div>
                            <p className="text-sm text-purple-600">Completion rate</p>
                        </CardContent>
                    </Card>

                    {/* Upcoming Activities Card */}
                    <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                                📅 Upcoming Activities
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-orange-900 mb-2">
                                {dashboardStats.upcomingActivities}
                            </div>
                            <p className="text-sm text-orange-600">Assignments & deadlines</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-gradient-to-r from-orange-50 to-amber-100 border-orange-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-orange-800 flex items-center gap-2">
                            📚 My Courses
                        </CardTitle>
                        <CardDescription className="text-orange-600 text-base">
                            Continue your learning journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                className="h-12 font-medium bg-orange-600 hover:bg-orange-700 transition-colors"
                                onClick={() => navigate('/courses')}
                            >
                                🔍 Browse Courses
                            </Button>
                            <Button variant="outline" className="h-12 font-medium hover:bg-orange-50 hover:border-orange-300 transition-colors">📋 View Assignments</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-teal-50 to-cyan-100 border-teal-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-teal-800 flex items-center gap-2">
                            🤖 AI Study Assistant
                        </CardTitle>
                        <CardDescription className="text-teal-600 text-base">
                            Get personalized help with your studies using AI
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-12 font-medium hover:bg-teal-50 hover:border-teal-300 transition-colors">🎓 Ask GPT Tutor</Button>
                            <Button variant="outline" className="h-12 font-medium hover:bg-teal-50 hover:border-teal-300 transition-colors">✨ Gemini Study Helper</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderDashboardContent = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'instructor':
                return <InstructorDashboard />;
            case 'student':
                return <StudentDashboard />;
            default:
                return (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-500">
                                Role not recognized. Please contact support.
                            </p>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">LearnHub Academy</h1>
                            <Badge className={getRoleColor(user?.role)}>
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-6">
                            <nav className="hidden md:flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/dashboard')}
                                    className="text-sm font-medium"
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/courses')}
                                    className="text-sm font-medium"
                                >
                                    Courses
                                </Button>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome, {user?.name || 'User'}
                            </span>
                            <Button variant="outline" onClick={handleLogout}>
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {user?.role === 'admin' && 'Admin Dashboard'}
                        {user?.role === 'instructor' && 'Instructor Dashboard'}
                        {user?.role === 'student' && 'Student Dashboard'}
                    </h2>
                    <p className="text-lg text-gray-600 mt-3 font-medium">
                        {user?.role === 'admin' && 'Comprehensive platform management and analytics'}
                        {user?.role === 'instructor' && 'Empower students with engaging course content'}
                        {user?.role === 'student' && 'Accelerate your learning journey'}
                    </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

                {renderDashboardContent()}
            </div>
        </div>
    );
};

export default Dashboard;