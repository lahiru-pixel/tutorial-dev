import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, DollarSign, BookOpen, PlayCircle, PlusCircle, Trash2, Edit2 } from 'lucide-react';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [loadError, setLoadError] = useState('');
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    setLoadError('');
    Promise.all([api.get('/api/admin/courses'), api.get('/api/admin/enrollments')])
      .then(([coursesRes, enrollmentsRes]) => {
        setCourses(coursesRes.data);
        setEnrollments(enrollmentsRes.data);
      })
      .catch(() => setLoadError('Unable to load courses and student counts. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, description, thumbnail_url: thumbnailUrl, is_published: isPublished };
    
    try {
      if (isEditing) {
        await api.put(`/api/admin/courses/${currentId}`, payload);
      } else {
        await api.post('/api/admin/courses', payload);
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to save course');
    }
  };

  const editCourse = (course) => {
    setIsEditing(true);
    setCurrentId(course.id);
    setTitle(course.title);
    setDescription(course.description || '');
    setThumbnailUrl(course.thumbnail_url || '');
    setIsPublished(course.is_published);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course? This will delete all related videos and enrollments.')) return;
    try {
      await api.delete(`/api/admin/courses/${id}`);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete course');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setThumbnailUrl('');
    setIsPublished(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-600">Loading...</div>;
  if (loadError) return <div role="alert" className="p-8 text-center text-brand-red"><p>{loadError}</p><button onClick={fetchCourses} className="mt-4 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2 rounded-lg">Retry loading</button></div>;

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
            <Link to="/admin/students" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
              <Users className="w-5 h-5" /> Manage Students
            </Link>
            <Link to="/admin/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-red text-white transition">
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
          <h1 className="text-3xl font-bold mb-6 text-brand-purple">Manage Courses</h1>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-brand-purple">{isEditing ? 'Edit Course' : 'Create New Course'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                <input 
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea 
                  rows="3" value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Thumbnail URL</label>
                <input 
                  type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" id="isPublished" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-red focus:ring-brand-red focus:ring-offset-white bg-slate-50 border-slate-200"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">Publish Course</label>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" className="bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2 rounded-lg flex items-center gap-2 transition">
                  {isEditing ? <Edit2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                  {isEditing ? 'Update Course' : 'Create Course'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="bg-slate-100 hover:bg-slate-200 text-brand-purple px-6 py-2 rounded-lg transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 flex flex-col">
                <div className="h-40 bg-slate-100 relative">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                  )}
                  <div className="absolute top-2 right-2">
                    {course.is_published ? (
                      <span className="bg-emerald-700 text-white text-xs px-2 py-1 rounded shadow">Published</span>
                    ) : (
                      <span className="bg-amber-700 text-white text-xs px-2 py-1 rounded shadow">Draft</span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-brand-purple mb-2">{course.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 flex-1 mb-4">{course.description}</p>
                  <p className="text-sm text-slate-600 mb-4">{enrollments.filter(enrollment => enrollment.course_id === course.id).length} enrolled students</p>
                  
                  <div className="flex flex-wrap items-center gap-2 justify-end border-t border-slate-200 pt-4 mt-auto">
                    <Link to={`/admin/courses/${course.id}/students`} className="mr-auto inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <Users className="w-4 h-4" /> Manage Students
                    </Link>
                    <button aria-label={`Edit ${course.title}`} onClick={() => editCourse(course)} className="p-2 text-brand-red hover:bg-brand-red-dark/10 rounded transition">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button aria-label={`Delete ${course.title}`} onClick={() => deleteCourse(course.id)} className="p-2 text-brand-red hover:bg-red-500/10 rounded transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full p-8 text-center text-slate-600 bg-white rounded-xl border border-slate-200 border-dashed">
                No courses created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
