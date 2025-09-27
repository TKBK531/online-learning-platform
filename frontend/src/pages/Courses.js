import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import api from '../services/api';

const Courses = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Create course form state (for instructors)
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            if (user?.role === 'instructor') {
                // Fetch instructor's courses
                const response = await api.get('/instructor/courses');
                if (response.data.status === 'success') {
                    setCourses(response.data.data);
                }
            } else if (user?.role === 'student') {
                // Fetch all courses and student's enrolled courses
                const [allCoursesRes, enrolledCoursesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/student/courses/enrolled')
                ]);

                if (allCoursesRes.data.status === 'success') {
                    setCourses(allCoursesRes.data.data);
                }

                if (enrolledCoursesRes.data.status === 'success') {
                    setEnrolledCourses(enrolledCoursesRes.data.data.map(enrollment => enrollment.course._id));
                }
            } else {
                // For admin, fetch all courses
                const response = await api.get('/courses');
                if (response.data.status === 'success') {
                    setCourses(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.title.trim() || !newCourse.description.trim()) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setCreateLoading(true);
            setError('');
            setSuccess('');

            const response = await api.post('/instructor/courses', newCourse);

            if (response.data.status === 'success') {
                setSuccess('Course created successfully!');
                setNewCourse({ title: '', description: '' });
                setShowCreateForm(false);
                fetchData(); // Refresh the courses list
            }
        } catch (error) {
            console.error('Error creating course:', error);
            setError(error.response?.data?.message || 'Failed to create course');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            const response = await api.delete(`/instructor/courses/${courseId}`);

            if (response.data.status === 'success') {
                setSuccess('Course deleted successfully!');
                fetchData(); // Refresh the courses list
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            setError(error.response?.data?.message || 'Failed to delete course');
        }
    };

    const handleEnrollCourse = async (courseId) => {
        try {
            setError('');
            setSuccess('');

            const response = await api.post(`/student/courses/${courseId}/enroll`);

            if (response.data.status === 'success') {
                setSuccess('Successfully enrolled in course!');
                setEnrolledCourses([...enrolledCourses, courseId]);
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            setError(error.response?.data?.message || 'Failed to enroll in course');
        }
    };

    const handleUnenrollCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to unenroll from this course?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            const response = await api.post(`/student/courses/${courseId}/drop`);

            if (response.data.status === 'success') {
                setSuccess('Successfully unenrolled from course!');
                setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
            }
        } catch (error) {
            console.error('Error unenrolling from course:', error);
            setError(error.response?.data?.message || 'Failed to unenroll from course');
        }
    };

    const isEnrolled = (courseId) => {
        return enrolledCourses.includes(courseId);
    };

    const renderInstructorView = () => (
        <div className="space-y-6">
            {/* Header with Create Course Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-600 mt-2">Manage and create your educational content</p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {showCreateForm ? 'Cancel' : '+ Create Course'}
                </Button>
            </div>

            {/* Create Course Form */}
            {showCreateForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Create New Course</CardTitle>
                        <CardDescription>Fill in the details to create a new course</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Title
                                </label>
                                <Input
                                    type="text"
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                    placeholder="Enter course title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <Input
                                    type="text"
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                    placeholder="Enter course description"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={createLoading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {createLoading ? 'Creating...' : 'Create Course'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course._id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{course.title}</CardTitle>
                                    <Badge
                                        variant="outline"
                                        className={course.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}
                                    >
                                        {course.status || 'published'}
                                    </Badge>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteCourse(course._id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                {course.description}
                            </CardDescription>
                            <div className="text-sm text-gray-500">
                                Created: {new Date(course.createdAt).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {courses.length === 0 && !loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="text-gray-500">
                            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                            <p>Create your first course to get started</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderStudentView = () => (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
                <p className="text-gray-600 mt-2">Discover and enroll in courses to advance your learning</p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course._id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{course.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-blue-700 bg-blue-50">
                                            {course.instructor.name}
                                        </Badge>
                                        {isEnrolled(course._id) && (
                                            <Badge className="bg-green-100 text-green-800">
                                                Enrolled
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                {course.description}
                            </CardDescription>
                            <div className="flex gap-2">
                                {isEnrolled(course._id) ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleUnenrollCourse(course._id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        Unenroll
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleEnrollCourse(course._id)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Enroll Now
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {courses.length === 0 && !loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="text-gray-500">
                            <h3 className="text-lg font-semibold mb-2">No courses available</h3>
                            <p>Check back later for new courses</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderAdminView = () => (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
                <p className="text-gray-600 mt-2">Platform-wide course overview</p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course._id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-blue-700 bg-blue-50">
                                    {course.instructor.name}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={course.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}
                                >
                                    {course.status || 'published'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                {course.description}
                            </CardDescription>
                            <div className="text-sm text-gray-500">
                                Created: {new Date(course.createdAt).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                {/* Messages */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}

                {/* Render appropriate view based on user role */}
                {user?.role === 'instructor' && renderInstructorView()}
                {user?.role === 'student' && renderStudentView()}
                {user?.role === 'admin' && renderAdminView()}
            </div>
        </div>
    );
};

export default Courses;