import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, DollarSign, BookOpen, PlayCircle, PlusCircle, Trash2 } from 'lucide-react';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const fetchData = () => {
    Promise.all([
      api.get('/api/admin/students'),
      api.get('/api/admin/courses'),
      api.get('/api/admin/enrollments')
    ]).then(([sRes, cRes, eRes]) => {
      setStudents(sRes.data);
      setCourses(cRes.data);
      setEnrollments(eRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePaid = async (id, currentStatus) => {
    try {
      await api.put(`/api/admin/students/${id}/pay`, { is_paid: !currentStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update student');
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourse) return;
    try {
      await api.post('/api/admin/enroll', { student_id: selectedStudent, course_id: selectedCourse });
      fetchData();
      setSelectedStudent('');
      setSelectedCourse('');
    } catch (err) {
      console.error(err);
      alert('Failed to enroll student. They might already be enrolled.');
    }
  };

  const removeEnrollment = async (student_id, course_id) => {
    if (!confirm('Remove enrollment?')) return;
    try {
      await api.delete('/api/admin/enroll', { data: { student_id, course_id } });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to remove enrollment');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-600">Loading...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 space-y-2">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="font-bold text-brand-purple uppercase text-xs tracking-wider mb-4">Admin Menu</h3>
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
              <DollarSign className="w-5 h-5" /> Dashboard
            </Link>
            <Link to="/admin/students" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-red text-white transition">
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
      <div className="min-w-0 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6 text-brand-purple">Students</h1>
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-700">Name</th>
                  <th className="p-4 font-semibold text-slate-700">Email</th>
                  <th className="p-4 font-semibold text-slate-700">Status</th>
                  <th className="p-4 font-semibold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-100/30 transition">
                    <td className="p-4 text-brand-purple font-medium">{student.name || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{student.email}</td>
                    <td className="p-4">
                      {student.is_paid ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-700/10 text-emerald-700 border border-emerald-500/20">Paid</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-brand-red border border-red-500/20">Unpaid</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => togglePaid(student.id, student.is_paid)}
                        className={`text-sm px-3 py-1.5 rounded transition border ${student.is_paid ? 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-brand-purple' : 'bg-brand-red border-brand-red hover:bg-brand-red-dark text-white'}`}
                      >
                        {student.is_paid ? 'Revoke Paid' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-600">No students registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-6 text-brand-purple">Enrollments</h2>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-brand-purple">Manual Enrollment</h3>
            <form onSubmit={handleEnroll} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-600 mb-1">Select Student</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                  value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-600 mb-1">Select Course</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                  value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full md:w-auto bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition h-[42px]">
                <PlusCircle className="w-4 h-4" /> Enroll
              </button>
            </form>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-700">Student</th>
                  <th className="p-4 font-semibold text-slate-700">Course</th>
                  <th className="p-4 font-semibold text-slate-700">Enrolled At</th>
                  <th className="p-4 font-semibold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enrollments.map(e => (
                  <tr key={e.id} className="hover:bg-slate-100/30 transition">
                    <td className="p-4 text-brand-purple font-medium">{e.profiles?.name || e.profiles?.email}</td>
                    <td className="p-4 text-slate-700">{e.courses?.title}</td>
                    <td className="p-4 text-slate-600 text-sm">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => removeEnrollment(e.student_id, e.course_id)} className="text-brand-red hover:text-brand-red-dark hover:bg-red-100/20 p-2 rounded transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-600">No enrollments yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
