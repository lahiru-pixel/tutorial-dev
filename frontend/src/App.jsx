import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/StudentDashboard';
import CoursePage from './pages/CoursePage';
import WatchPage from './pages/WatchPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageCourses from './pages/admin/ManageCourses';
import CourseStudents from './pages/admin/CourseStudents';
import ManageVideos from './pages/admin/ManageVideos';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Student Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/courses/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
              <Route path="/videos/:id/watch" element={<ProtectedRoute><WatchPage /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/students" element={<AdminRoute><ManageStudents /></AdminRoute>} />
              <Route path="/admin/courses" element={<AdminRoute><ManageCourses /></AdminRoute>} />
              <Route path="/admin/courses/:courseId/students" element={<AdminRoute><CourseStudents /></AdminRoute>} />
              <Route path="/admin/videos" element={<AdminRoute><ManageVideos /></AdminRoute>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
