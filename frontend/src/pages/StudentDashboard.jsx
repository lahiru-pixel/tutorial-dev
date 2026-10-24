import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen } from 'lucide-react';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/students/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading courses...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8 text-brand-purple">My Courses</h1>
      
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 flex flex-col items-center">
          <BookOpen className="w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No courses yet</h3>
          <p className="text-slate-600 mt-2">You are not enrolled in any courses currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link key={course.id} to={`/courses/${course.id}`} className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-brand-red hover:shadow-lg hover:shadow-brand-red/10 transition group">
              <div className="h-48 bg-slate-100 relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 bg-white">No Image</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-brand-purple mb-2">{course.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2">{course.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
