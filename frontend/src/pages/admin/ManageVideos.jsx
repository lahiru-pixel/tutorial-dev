import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, DollarSign, BookOpen, PlayCircle, PlusCircle, Trash2, Edit2, ArrowUp, ArrowDown } from 'lucide-react';

export default function ManageVideos() {
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [durationText, setDurationText] = useState('');

  useEffect(() => {
    api.get('/api/admin/courses')
      .then(res => {
        setCourses(res.data);
        if (res.data.length > 0) {
          setSelectedCourse(res.data[0].id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchVideos(selectedCourse);
    } else {
      setVideos([]);
    }
  }, [selectedCourse]);

  const fetchVideos = (courseId) => {
    api.get(`/api/admin/videos?course_id=${courseId}`)
      .then(res => setVideos(res.data))
      .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return alert('Please select a course first');
    
    // Auto-calculate order index for new videos
    const nextOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order_index || 0)) + 1 : 1;
    
    const payload = { 
      course_id: selectedCourse,
      title, 
      description, 
      youtube_url: youtubeUrl, 
      duration_text: durationText,
      ...(isEditing ? {} : { order_index: nextOrder })
    };
    
    try {
      if (isEditing) {
        await api.put(`/api/admin/videos/${currentId}`, payload);
      } else {
        await api.post('/api/admin/videos', payload);
      }
      resetForm();
      fetchVideos(selectedCourse);
    } catch (err) {
      console.error(err);
      alert('Failed to save video');
    }
  };

  const editVideo = (video) => {
    setIsEditing(true);
    setCurrentId(video.id);
    setTitle(video.title);
    setDescription(video.description || '');
    setYoutubeUrl(video.youtube_url || '');
    setDurationText(video.duration_text || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteVideo = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/api/admin/videos/${id}`);
      fetchVideos(selectedCourse);
    } catch (err) {
      console.error(err);
      alert('Failed to delete video');
    }
  };

  const moveVideo = async (index, direction) => {
    const newVideos = [...videos];
    if (direction === 'up' && index > 0) {
      const temp = newVideos[index].order_index;
      newVideos[index].order_index = newVideos[index - 1].order_index;
      newVideos[index - 1].order_index = temp;
    } else if (direction === 'down' && index < newVideos.length - 1) {
      const temp = newVideos[index].order_index;
      newVideos[index].order_index = newVideos[index + 1].order_index;
      newVideos[index + 1].order_index = temp;
    } else {
      return;
    }
    
    // Update in DB (simple approach: update both)
    const updates = direction === 'up' 
      ? [
          api.put(`/api/admin/videos/${newVideos[index].id}`, { order_index: newVideos[index].order_index }),
          api.put(`/api/admin/videos/${newVideos[index - 1].id}`, { order_index: newVideos[index - 1].order_index })
        ]
      : [
          api.put(`/api/admin/videos/${newVideos[index].id}`, { order_index: newVideos[index].order_index }),
          api.put(`/api/admin/videos/${newVideos[index + 1].id}`, { order_index: newVideos[index + 1].order_index })
        ];

    try {
      await Promise.all(updates);
      fetchVideos(selectedCourse);
    } catch (err) {
      console.error(err);
      alert('Failed to reorder videos');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setDurationText('');
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
            <Link to="/admin/students" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
              <Users className="w-5 h-5" /> Manage Students
            </Link>
            <Link to="/admin/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
              <BookOpen className="w-5 h-5" /> Manage Courses
            </Link>
            <Link to="/admin/videos" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-red text-white transition">
              <PlayCircle className="w-5 h-5" /> Manage Videos
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="min-w-0 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6 text-brand-purple">Manage Videos</h1>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
            <label className="block text-sm font-medium text-slate-600 mb-2">Select Course to Manage</label>
            <select 
              className="w-full md:w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-brand-purple outline-none focus:border-brand-red font-medium"
              value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              {courses.length === 0 && <option value="">No courses available</option>}
            </select>
          </div>

          {selectedCourse && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 h-fit sticky top-24">
                <h3 className="text-lg font-semibold mb-4 text-brand-purple">{isEditing ? 'Edit Video' : 'Add New Video'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                    <input 
                      type="text" required value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">YouTube URL (Unlisted)</label>
                    <input 
                      type="url" required value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtu.be/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Duration Text</label>
                    <input 
                      type="text" value={durationText} onChange={e => setDurationText(e.target.value)}
                      placeholder="e.g. 12:34"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Description (Optional)</label>
                    <textarea 
                      rows="3" value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-brand-purple outline-none focus:border-brand-red"
                    ></textarea>
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                    <button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition">
                      {isEditing ? <Edit2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                      {isEditing ? 'Update Video' : 'Add Video'}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={resetForm} className="bg-slate-100 hover:bg-slate-200 text-brand-purple px-6 py-2 rounded-lg transition">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
              
              {/* List */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-4 text-brand-purple">Course Videos ({videos.length})</h3>
                {videos.map((video, index) => (
                  <div key={video.id} className="bg-white rounded-xl p-4 border border-slate-200 flex gap-4 items-center group">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => moveVideo(index, 'up')} disabled={index === 0}
                        className={`p-1 rounded transition ${index === 0 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 hover:text-brand-purple'}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => moveVideo(index, 'down')} disabled={index === videos.length - 1}
                        className={`p-1 rounded transition ${index === videos.length - 1 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 hover:text-brand-purple'}`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-purple">{video.title}</h4>
                      <p className="text-sm text-slate-600">{video.duration_text || 'No duration'}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => editVideo(video)} className="p-2 text-brand-red hover:bg-brand-red-dark/10 rounded transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteVideo(video.id)} className="p-2 text-brand-red hover:bg-red-500/10 rounded transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {videos.length === 0 && (
                  <div className="p-8 text-center text-slate-600 bg-white rounded-xl border border-slate-200 border-dashed">
                    No videos for this course yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
