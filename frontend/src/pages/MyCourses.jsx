import { useEffect, useState } from 'react';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../services/api';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Replace with actual API call to get registered courses for user
        const res = await coursesAPI.getMyCourses();
        setCourses(res.data.courses || []);
      } catch (error) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">My Registered Courses</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-gray-400">You have not registered for any courses yet.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
              <img
                src={getImageUrl(course.imageUrl)}
                alt={course.title}
                className="h-20 w-20 object-cover rounded"
              />
              <div>
                <h2 className="font-semibold text-lg">{course.title}</h2>
                <div className="text-sm text-gray-500 mb-1">{course.instructor}</div>
                <div className="text-sm text-gray-600">{course.category}</div>
                <div className="text-primary-700 font-bold mt-2">₹{course.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
