import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, Users } from 'lucide-react';
import api from '../../services/api';

export default function CourseStudents() {
  const { courseId } = useParams();
  return <CourseStudentList key={courseId} courseId={courseId} />;
}

function CourseStudentList({ courseId }) {
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [failedAction, setFailedAction] = useState(null);
  const [notice, setNotice] = useState('');
  const savingRef = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal };
    setLoading(true);
    setLoadError('');
    Promise.all([
      api.get('/api/admin/courses', config),
      api.get('/api/admin/students', config),
      api.get('/api/admin/enrollments', config),
    ]).then(([coursesRes, studentsRes, enrollmentsRes]) => {
      if (controller.signal.aborted) return;
      setCourse(coursesRes.data.find(item => item.id === courseId) || null);
      setStudents(studentsRes.data);
      setEnrollments(enrollmentsRes.data.filter(item => item.course_id === courseId));
    }).catch(err => {
      if (!controller.signal.aborted) setLoadError(err.response?.data?.error || 'Unable to load course students. Please try again.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [courseId, reload]);

  const enrolledIds = new Set(enrollments.map(item => item.student_id));
  const matches = (student, query) => `${student?.name || ''} ${student?.email || ''}`.toLowerCase().includes(query.trim().toLowerCase());
  const available = students.filter(student => !enrolledIds.has(student.id));
  const matchingAvailable = available.filter(student => matches(student, availableSearch));
  const visibleEnrollments = enrollments.filter(enrollment => matches(enrollment.profiles, search));

  const saveEnrollment = async (action, studentId) => {
    if (savingRef.current) return;
    if (action === 'add' && !available.some(student => student.id === studentId)) return;
    const student = students.find(item => item.id === studentId);
    if (action === 'remove' && !window.confirm(`Remove ${student?.name || student?.email || 'this student'} from ${course.title}?`)) return;

    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    setFailedAction(null);
    setNotice('');
    const payload = { student_id: studentId, course_id: courseId };
    try {
      if (action === 'add') {
        const response = await api.post('/api/admin/enroll', payload);
        if (!mounted.current) return;
        setEnrollments(current => [
          { ...response.data, ...payload, profiles: student },
          ...current.filter(item => item.student_id !== studentId),
        ]);
        setSelectedStudent('');
        setAvailableSearch('');
        setNotice(`${student.name || student.email} added to this course.`);
      } else {
        await api.delete('/api/admin/enroll', { data: payload });
        if (!mounted.current) return;
        setEnrollments(current => current.filter(item => item.student_id !== studentId));
        setNotice('Enrollment removed.');
      }
    } catch (err) {
      if (!mounted.current) return;
      setSaveError(err.response?.data?.error || 'Unable to save enrollment. Please try again.');
      setFailedAction({ action, studentId });
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      <Link to="/admin/courses" className="inline-flex items-center gap-2 text-brand-red hover:text-brand-red-dark font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>
      {loading ? <p role="status">Loading course students...</p> : loadError ? (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-6 text-brand-red">
          <p>{loadError}</p>
          <button onClick={() => setReload(value => value + 1)} className="mt-3 bg-brand-red hover:bg-brand-red-dark text-white rounded-lg px-4 py-2">Retry loading</button>
        </div>
      ) : !course ? <h1 className="text-2xl font-bold">Course not found</h1> : (
        <>
          <div>
            <h1 className="text-3xl font-bold break-words">Manage Students: {course.title}</h1>
            <p className="text-slate-600 mt-2 flex items-center gap-2" aria-live="polite"><Users className="w-5 h-5" /> {enrollments.length} enrolled {enrollments.length === 1 ? 'student' : 'students'}</p>
            <p className="text-sm text-slate-600 mt-2">Manage account-wide payments in the <Link to="/admin/students" className="text-brand-red underline">Students tab</Link>.</p>
          </div>
          <p role="status" className="text-emerald-700">{saving ? 'Saving enrollment...' : notice}</p>
          {saveError && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-brand-red">
              <p>{saveError}</p>
              <button disabled={saving} onClick={() => saveEnrollment(failedAction.action, failedAction.studentId)} className="mt-2 underline font-medium">Retry saving</button>
            </div>
          )}
          <section aria-labelledby="add-student-heading" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <h2 id="add-student-heading" className="text-xl font-bold mb-4">Add a student</h2>
            <form onSubmit={event => { event.preventDefault(); saveEnrollment('add', selectedStudent); }} className="space-y-4">
              <div>
                <label htmlFor="available-search" className="block text-sm font-medium mb-1">Search available students</label>
                <input id="available-search" type="search" placeholder="Name or email" value={availableSearch} disabled={saving} onChange={event => { setAvailableSearch(event.target.value); setSelectedStudent(''); }} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              {available.length === 0 ? <p className="text-slate-600">{students.length === 0 ? 'No students registered yet.' : 'All students are already enrolled in this course.'}</p> : matchingAvailable.length === 0 ? <p className="text-slate-600">No available students match your search.</p> : (
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1 min-w-0">
                    <label htmlFor="available-student" className="block text-sm font-medium mb-1">Available students ({matchingAvailable.length})</label>
                    <select id="available-student" required value={selectedStudent} disabled={saving} onChange={event => setSelectedStudent(event.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2">
                      <option value="">Choose a student</option>
                      {matchingAvailable.map(student => <option key={student.id} value={student.id}>{student.name || 'Unnamed student'} — {student.email}</option>)}
                    </select>
                  </div>
                  <button disabled={saving || !selectedStudent} type="submit" className="bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Add Student
                  </button>
                </div>
              )}
            </form>
          </section>
          <section aria-labelledby="enrolled-heading" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <h2 id="enrolled-heading" className="text-xl font-bold mb-4">Enrolled students ({enrollments.length})</h2>
            <label htmlFor="enrolled-search" className="block text-sm font-medium mb-1">Search enrolled students</label>
            <input id="enrolled-search" type="search" placeholder="Name or email" value={search} onChange={event => setSearch(event.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 mb-4" />
            {enrollments.length === 0 ? <p className="text-slate-600">No students enrolled in this course yet.</p> : visibleEnrollments.length === 0 ? <p className="text-slate-600">No enrolled students match your search.</p> : (
              <ul className="divide-y divide-slate-200">
                {visibleEnrollments.map(enrollment => (
                  <li key={enrollment.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 break-words">
                      <p className="font-semibold text-brand-purple">{enrollment.profiles?.name || 'Unnamed student'}</p>
                      <p className="text-sm text-slate-600">{enrollment.profiles?.email || 'Student unavailable'}</p>
                    </div>
                    <button disabled={saving || !enrollment.student_id} onClick={() => saveEnrollment('remove', enrollment.student_id)} aria-label={`Remove ${enrollment.profiles?.name || enrollment.profiles?.email || 'student'}`} className="flex items-center gap-2 border border-red-200 text-brand-red hover:bg-red-50 rounded-lg px-3 py-2">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
