import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const Courses = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        confirmText: 'Confirm',
        variant: 'destructive',
        onConfirm: null,
        loading: false
    });

    // Create course form state (for instructors)
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    // Filter states
    const [instructorFilter, setInstructorFilter] = useState('all-courses'); // 'all-courses', 'my-courses'
    const [studentFilter, setStudentFilter] = useState('all'); // 'all', 'enrolled', 'available'

    // Helper functions for confirmation dialogs
    const openConfirmDialog = (title, description, onConfirm, confirmText = 'Confirm', variant = 'destructive') => {
        setConfirmDialog({
            isOpen: true,
            title,
            description,
            confirmText,
            variant,
            onConfirm,
            loading: false
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    };

    const setConfirmLoading = (loading) => {
        setConfirmDialog(prev => ({ ...prev, loading }));
    };

    const handleCancelCreateForm = () => {
        const hasData = newCourse.title.trim() || newCourse.description.trim();

        if (hasData) {
            openConfirmDialog(
                'Cancel Course Creation',
                'Are you sure you want to cancel? All entered information will be lost.',
                () => {
                    setNewCourse({ title: '', description: '' });
                    setShowCreateForm(false);
                    closeConfirmDialog();
                },
                'Yes, Cancel',
                'destructive'
            );
        } else {
            setShowCreateForm(false);
        }
    };

    const fetchData = useCallback(async () => {
        console.log('🚀 fetchData called');
        try {
            setLoading(true);

            console.log('👤 Current user:', user);
            console.log('🔐 User role:', user?.role);

            // Don't fetch if user is not loaded yet
            if (!user || !user.role) {
                console.log('⏳ User not loaded yet, skipping fetch');
                setLoading(false);
                return;
            }

            if (user?.role === 'instructor') {
                console.log('👨‍🏫 Instructor: Fetching all courses data...');
                // Fetch all courses (same as students)
                const response = await api.get('/courses');
                console.log('📚 All courses response:', response.data);
                if (response.data.status === 'success') {
                    const validCourses = response.data.data.filter(course => course && course._id);
                    console.log('✅ Valid courses:', validCourses);
                    console.log('🔍 Course statuses:', validCourses.map(c => ({ title: c.title, status: c.status, instructor: c.instructor?._id })));
                    setCourses(validCourses);
                }
            } else if (user?.role === 'student') {
                console.log('🎓 Student: Fetching courses data...');
                // Fetch all courses and student's enrolled courses
                const [allCoursesRes, enrolledCoursesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/student/courses')
                ]);

                if (allCoursesRes.data.status === 'success') {
                    // Filter only published courses for students and ensure courses are not null
                    const publishedCourses = allCoursesRes.data.data.filter(course =>
                        course && course._id && (course.status === 'published' || !course.status)
                    );
                    console.log(`✅ Found ${publishedCourses.length} published courses for student`);
                    setCourses(publishedCourses);
                }

                if (enrolledCoursesRes.data.status === 'success') {
                    console.log('🔍 Raw enrolled courses data:', enrolledCoursesRes.data.data);
                    const validEnrollments = enrolledCoursesRes.data.data.filter(enrollment => {
                        if (!enrollment.course) {
                            console.warn('⚠️ Found enrollment with null course:', enrollment);
                            return false;
                        }
                        return enrollment.course._id;
                    });
                    const enrolledIds = validEnrollments.map(enrollment => enrollment.course._id);
                    console.log('📝 Valid enrolled course IDs:', enrolledIds);
                    setEnrolledCourses(enrolledIds);
                }
            } else {
                // For admin, fetch all courses
                const response = await api.get('/courses');
                if (response.data.status === 'success') {
                    const validCourses = response.data.data.filter(course => course && course._id);
                    setCourses(validCourses);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to load courses: ${error.response?.data?.message || error.message}`,
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.title.trim() || !newCourse.description.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill in all fields",
            });
            return;
        }

        try {
            setCreateLoading(true);

            const response = await api.post('/instructor/courses', newCourse);

            if (response.data.status === 'success') {
                toast({
                    variant: "success",
                    title: "Success",
                    description: "Course created successfully!",
                });
                setNewCourse({ title: '', description: '' });
                setShowCreateForm(false);
                fetchData(); // Refresh the courses list
            }
        } catch (error) {
            console.error('Error creating course:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Failed to create course',
            });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteCourse = (courseId, courseTitle) => {
        openConfirmDialog(
            'Delete Course',
            `Are you sure you want to delete "${courseTitle}"? This action cannot be undone and will permanently remove the course and all its content.`,
            () => confirmDeleteCourse(courseId),
            'Delete Course',
            'destructive'
        );
    };

    const confirmDeleteCourse = async (courseId) => {
        try {
            setConfirmLoading(true);
            const response = await api.delete(`/instructor/courses/${courseId}`);

            if (response.data.status === 'success') {
                toast({
                    variant: "success",
                    title: "Success",
                    description: "Course deleted successfully!",
                });
                fetchData(); // Refresh the courses list
                closeConfirmDialog();
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Failed to delete course',
            });
            setConfirmLoading(false);
        }
    };

    const handleEnrollCourse = (courseId, courseTitle) => {
        openConfirmDialog(
            'Enroll in Course',
            `Are you sure you want to enroll in "${courseTitle}"? You will gain access to all course materials and can start learning immediately.`,
            () => confirmEnrollCourse(courseId),
            'Enroll Now',
            'default'
        );
    };

    const confirmEnrollCourse = async (courseId) => {
        try {
            setConfirmLoading(true);
            const response = await api.post(`/student/courses/${courseId}/enroll`);

            if (response.data.status === 'success') {
                toast({
                    variant: "success",
                    title: "Success",
                    description: "Successfully enrolled in course!",
                });
                setEnrolledCourses([...enrolledCourses, courseId]);
                closeConfirmDialog();
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Failed to enroll in course',
            });
            setConfirmLoading(false);
        }
    };

    const handleUnenrollCourse = (courseId, courseTitle) => {
        openConfirmDialog(
            'Unenroll from Course',
            `Are you sure you want to unenroll from "${courseTitle}"? You will lose access to all course materials and your progress will be saved.`,
            () => confirmUnenrollCourse(courseId),
            'Unenroll',
            'destructive'
        );
    };

    const confirmUnenrollCourse = async (courseId) => {
        try {
            setConfirmLoading(true);
            const response = await api.post(`/student/courses/${courseId}/drop`);

            if (response.data.status === 'success') {
                toast({
                    variant: "success",
                    title: "Success",
                    description: "Successfully unenrolled from course!",
                });
                setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
                closeConfirmDialog();
            }
        } catch (error) {
            console.error('Error unenrolling from course:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Failed to unenroll from course',
            });
            setConfirmLoading(false);
        }
    };

    const isEnrolled = (courseId) => {
        return enrolledCourses.includes(courseId);
    };

    // Helper function to check if user owns the course
    const isOwnCourse = (course) => {
        return course.instructor && (course.instructor._id === user?.id || course.instructor === user?.id);
    };

    // Filter functions
    const getFilteredInstructorCourses = () => {
        switch (instructorFilter) {
            case 'my-courses':
                return courses.filter(course => isOwnCourse(course));
            case 'all-courses':
                return courses;
            default:
                return courses;
        }
    };

    const getFilteredStudentCourses = () => {
        switch (studentFilter) {
            case 'enrolled':
                return courses.filter(course => isEnrolled(course._id));
            case 'available':
                return courses.filter(course => !isEnrolled(course._id));
            default:
                return courses;
        }
    };

    const renderInstructorView = () => (
        <div className="space-y-6">
            {/* Header with Create Course Button */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                        <p className="text-gray-600 mt-2">View all courses and manage your own educational content</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {showCreateForm ? 'Cancel' : '+ Create Course'}
                    </Button>
                </div>

                {/* Filter Controls */}
                <div className="flex gap-4">
                    <Button
                        variant={instructorFilter === 'all-courses' ? 'default' : 'outline'}
                        onClick={() => setInstructorFilter('all-courses')}
                        className="min-w-[120px]"
                    >
                        All Courses ({courses.length})
                    </Button>
                    <Button
                        variant={instructorFilter === 'my-courses' ? 'default' : 'outline'}
                        onClick={() => setInstructorFilter('my-courses')}
                        className="min-w-[120px]"
                    >
                        My Courses ({courses.filter(course => isOwnCourse(course)).length})
                    </Button>
                </div>
            </div>            {/* Create Course Form */}
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
                                <Textarea
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                    placeholder="Enter course description..."
                                    className="min-h-[100px] resize-none"
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
                                    onClick={() => handleCancelCreateForm()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredInstructorCourses().map((course) => (
                    <Card key={course._id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg group">
                        {/* Course Image */}
                        <div className="h-56 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                                <Badge className={(course.status === 'published' || !course.status) ? 'bg-green-500 text-white shadow-lg' : 'bg-orange-500 text-white shadow-lg'}>
                                    {(course.status === 'published' || !course.status) ? '✓ Published' : '📝 Draft'}
                                </Badge>
                            </div>

                            {/* Delete Button - Only for own courses */}
                            {isOwnCourse(course) && (
                                <div className="absolute top-4 right-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteCourse(course._id, course.title)}
                                        className="bg-white/90 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 backdrop-blur-sm"
                                    >
                                        🗑️ Delete
                                    </Button>
                                </div>
                            )}

                            {/* Course Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                                    {course.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-sm text-white font-semibold">
                                        {course.instructor?.name?.charAt(0) || 'I'}
                                    </div>
                                    <span className="text-white/90 text-sm font-medium">
                                        {isOwnCourse(course) ? 'You (Instructor)' : (course.instructor?.name || 'Instructor')}
                                    </span>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 border-2 border-white/30 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl">🎓</span>
                            </div>
                        </div>

                        {/* Card Content */}
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <CardDescription className="text-gray-600 text-base leading-relaxed line-clamp-3">
                                    {course.description}
                                </CardDescription>

                                {/* Course Stats */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>📅</span>
                                        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>👥</span>
                                        <span>Students</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>            {getFilteredInstructorCourses().length === 0 && !loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="text-gray-500">
                            <h3 className="text-lg font-semibold mb-2">
                                {instructorFilter === 'all-courses' ? 'No courses available' : 'No courses created yet'}
                            </h3>
                            <p>
                                {instructorFilter === 'all-courses' ? 'Check back later for new courses' : 'Create your first course to get started'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderStudentView = () => (
        <div className="space-y-6">
            {/* Header with Filter Controls */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
                    <p className="text-gray-600 mt-2">Discover and enroll in courses to advance your learning</p>
                </div>

                {/* Filter Controls */}
                <div className="flex gap-4">
                    <Button
                        variant={studentFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setStudentFilter('all')}
                        className="min-w-[120px]"
                    >
                        All Courses
                    </Button>
                    <Button
                        variant={studentFilter === 'enrolled' ? 'default' : 'outline'}
                        onClick={() => setStudentFilter('enrolled')}
                        className="min-w-[120px]"
                    >
                        Enrolled ({enrolledCourses.length})
                    </Button>
                    <Button
                        variant={studentFilter === 'available' ? 'default' : 'outline'}
                        onClick={() => setStudentFilter('available')}
                        className="min-w-[120px]"
                    >
                        Available
                    </Button>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredStudentCourses().map((course) => (
                    <Card key={course._id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg group">
                        {/* Course Image */}
                        <div className="h-56 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                            {/* Enrollment Status Badge */}
                            {isEnrolled(course._id) && (
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-green-500 text-white shadow-lg">
                                        ✓ Enrolled
                                    </Badge>
                                </div>
                            )}

                            {/* Course Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                                    {course.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-sm text-white font-semibold">
                                        {course.instructor?.name?.charAt(0) || 'I'}
                                    </div>
                                    <span className="text-white/90 text-sm font-medium">{course.instructor?.name || 'Instructor'}</span>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-4 left-4 w-12 h-12 border-2 border-white/30 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl">📚</span>
                            </div>
                        </div>

                        {/* Card Content */}
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <CardDescription className="text-gray-600 text-base leading-relaxed line-clamp-3">
                                    {course.description}
                                </CardDescription>

                                {/* Action Button */}
                                <div className="pt-4">
                                    {isEnrolled(course._id) ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleUnenrollCourse(course._id, course.title)}
                                            className="w-full border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all"
                                        >
                                            📤 Unenroll from Course
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleEnrollCourse(course._id, course.title)}
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                        >
                                            🚀 Enroll Now
                                        </Button>
                                    )}
                                </div>

                                {/* Course Stats */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>🎓</span>
                                        <span>Interactive Learning</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>⭐</span>
                                        <span>4.9</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {getFilteredStudentCourses().length === 0 && !loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="text-gray-500">
                            <h3 className="text-lg font-semibold mb-2">
                                {studentFilter === 'all' ? 'No courses available' :
                                    studentFilter === 'enrolled' ? 'No enrolled courses' :
                                        'No available courses'}
                            </h3>
                            <p>
                                {studentFilter === 'all' ? 'Check back later for new courses' :
                                    studentFilter === 'enrolled' ? 'Enroll in some courses to see them here' :
                                        'All courses are already enrolled!'}
                            </p>
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
                    <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
                        {/* Course Image */}
                        <div className="h-48 bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                            <div className="absolute top-4 left-4">
                                <Badge
                                    className={course.status === 'published' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}
                                >
                                    {course.status || 'published'}
                                </Badge>
                            </div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-xl font-bold">{course.title}</h3>
                            </div>
                            <div className="absolute top-4 right-4">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg">📊</span>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                                        {course.instructor?.name?.charAt(0) || 'I'}
                                    </div>
                                    <Badge variant="outline" className="text-blue-700 bg-blue-50">
                                        {course.instructor?.name || 'Instructor'}
                                    </Badge>
                                </div>

                                <CardDescription className="text-gray-600 line-clamp-3">
                                    {course.description}
                                </CardDescription>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-sm text-gray-500">
                                        📅 {new Date(course.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>👥</span>
                                        <span>Admin View</span>
                                    </div>
                                </div>
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
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/chat')}
                                    className="text-sm font-medium"
                                >
                                    🤖 AI Chat
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
                {/* Render appropriate view based on user role */}
                {user?.role === 'instructor' && renderInstructorView()}
                {user?.role === 'student' && renderStudentView()}
                {user?.role === 'admin' && renderAdminView()}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={closeConfirmDialog}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText={confirmDialog.confirmText}
                variant={confirmDialog.variant}
                loading={confirmDialog.loading}
            />
        </div>
    );
};

export default Courses;