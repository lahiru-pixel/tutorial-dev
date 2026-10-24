import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { PlayCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    api.get(`/api/courses/${id}`)
      .then(res => setCourse(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading course...</div>;
  if (!course) return <div className="p-8 text-center text-slate-600">Course not found</div>;

  const canWatch = profile?.is_paid || profile?.role === 'admin';

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8 flex flex-col md:flex-row gap-8 items-start">
        {course.thumbnail_url && (
          <img src={course.thumbnail_url} alt={course.title} className="w-full md:w-64 h-40 object-cover rounded-xl shadow-lg" />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-brand-purple">{course.title}</h1>
          <p className="text-slate-600 text-lg leading-relaxed">{course.description}</p>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        Course Content
        <span className="text-sm font-normal text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          {course.videos?.length || 0} videos
        </span>
      </h2>
      
      <div className="space-y-4">
        {course.videos?.map((video, index) => (
          <div key={video.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition">
            <div className="flex items-center gap-4">
              <div className="text-slate-600 font-mono text-lg font-bold w-8 text-center">{index + 1}</div>
              <div>
                <h3 className="font-semibold text-brand-purple text-lg">{video.title}</h3>
                <div className="flex gap-4 text-sm text-slate-600 mt-1">
                  <span>{video.duration_text || 'Unknown duration'}</span>
                </div>
              </div>
            </div>
            {canWatch ? (
              <Link 
                to={`/videos/${video.id}/watch`} 
                className="bg-brand-red/10 text-brand-red hover:bg-brand-red-dark hover:text-white border border-brand-red/20 px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
              >
                <PlayCircle className="w-5 h-5" />
                Watch
              </Link>
            ) : (
              <div className="text-slate-600 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <Lock className="w-4 h-4" />
                Locked
              </div>
            )}
          </div>
        ))}
        
        {(!course.videos || course.videos.length === 0) && (
           <div className="text-center text-slate-600 py-12 bg-white rounded-xl border border-slate-200 border-dashed">No videos added yet.</div>
        )}
      </div>
    </div>
  );
}
