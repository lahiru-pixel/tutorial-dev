import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, BookOpen, PlayCircle, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_students: 0, total_paid: 0, total_courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading admin stats...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 space-y-2">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="font-bold text-brand-purple uppercase text-xs tracking-wider mb-4">Admin Menu</h3>
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-red text-white transition">
              <DollarSign className="w-5 h-5" /> Dashboard
            </Link>
            <Link to="/admin/students" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
              <Users className="w-5 h-5" /> Manage Students
            </Link>
            <Link to="/admin/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
              <BookOpen className="w-5 h-5" /> Manage Courses
            </Link>
            <Link to="/admin/videos" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
              <PlayCircle className="w-5 h-5" /> Manage Videos
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6 text-brand-purple">Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center gap-4">
            <div className="bg-brand-red/20 p-4 rounded-lg">
              <Users className="w-8 h-8 text-brand-red" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Students</p>
              <h3 className="text-3xl font-bold text-brand-purple">{stats.total_students}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center gap-4">
            <div className="bg-emerald-700/20 p-4 rounded-lg">
              <DollarSign className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Paid Students</p>
              <h3 className="text-3xl font-bold text-brand-purple">{stats.total_paid}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center gap-4">
            <div className="bg-amber-700/20 p-4 rounded-lg">
              <BookOpen className="w-8 h-8 text-amber-800" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Courses</p>
              <h3 className="text-3xl font-bold text-brand-purple">{stats.total_courses}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
