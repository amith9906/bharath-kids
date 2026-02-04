import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminAPI, getImageUrl } from '../../services/api';
import AddEditCourse from './AddEditCourse';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [page, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const res = await adminAPI.getCourses(params);
      setCourses(res.data.courses || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      toast.error('Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await adminAPI.deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error('Error deleting course');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingCourse) {
        await adminAPI.updateCourse(editingCourse.id, data);
        toast.success('Course updated');
      } else {
        await adminAPI.createCourse(data);
        toast.success('Course added');
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Courses Management</h1>
        <button className="btn btn-primary flex items-center gap-2" onClick={handleAdd}>
          <FiPlus className="w-5 h-5" /> Add Course
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, instructor, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full"
            onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
          />
        </div>
        <select
          className="input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No courses found.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-4 py-3">
                    {course.imageUrl ? (
                      <img src={getImageUrl(course.imageUrl)} alt={course.title} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded">
                        <FiImage className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">{course.title}</td>
                  <td className="px-4 py-3">{course.instructor}</td>
                  <td className="px-4 py-3">{course.category}</td>
                  <td className="px-4 py-3">{formatCurrency(course.price)}</td>
                  <td className="px-4 py-3">
                    {course.isActive ? (
                      <span className="badge bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="badge bg-gray-200 text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button className="btn btn-xs btn-secondary" onClick={() => handleEdit(course)}>
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(course.id)}>
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              className={`btn btn-xs ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {showModal && (
        <AddEditCourse
          course={editingCourse}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CoursesManagement;
