import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiSearch, FiX } from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    city: '',
    state: '',
    password: '',
    courseIds: []
  });

  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations');
      setRegistrations(res.data.registrations || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch registrations');
      showNotification('Failed to fetch registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const handleCreateRegistration = async (e) => {
    e.preventDefault();
    
    if (formData.courseIds.length === 0) {
      showNotification('Please select at least one course', 'error');
      return;
    }
    
    try {
      await api.post('/registrations', formData);
      showNotification('Registration(s) created successfully', 'success');
      setShowModal(false);
      setFormData({ email: '', name: '', phone: '', city: '', state: '', password: '', courseIds: [] });
      fetchRegistrations();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to create registration', 'error');
    }
  };

  const handleEdit = (registration) => {
    setEditingRegistration(registration);
    setShowEditModal(true);
  };

  const handleUpdateRegistration = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/registrations/${editingRegistration.id}`, {
        status: editingRegistration.status
      });
      showNotification('Registration updated successfully', 'success');
      setShowEditModal(false);
      setEditingRegistration(null);
      fetchRegistrations();
    } catch (err) {
      showNotification('Failed to update registration', 'error');
    }
  };

  const toggleCourseSelection = (courseId) => {
    setFormData(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId]
    }));
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/registrations/${id}/status`, { status: newStatus });
      showNotification(`Registration ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchRegistrations();
    } catch (err) {
      showNotification('Failed to update registration status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    
    try {
      await api.delete(`/registrations/${id}`);
      showNotification('Registration deleted successfully', 'success');
      fetchRegistrations();
    } catch (err) {
      showNotification('Failed to delete registration', 'error');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Registrations</h1>
            <p className="text-gray-600 mt-1">Manage all student course registrations</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Add Registration
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {registrations.filter(r => r.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">
                {registrations.filter(r => r.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FiXCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No registrations found
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{reg.user?.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {reg.user?.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {reg.user?.phone}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{reg.course?.title}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {reg.course?.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(reg.id, reg.status)}
                        className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                          reg.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {reg.status === 'active' ? (
                          <>
                            <FiCheckCircle className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <FiXCircle className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(reg)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit registration"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete registration"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Registration</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ email: '', name: '', phone: '', city: '', state: '', password: '', courseIds: [] });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateRegistration} className="space-y-4">
                <div>
                  <label className="label">Student Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="label">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="input"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.email ? 'If user exists, existing account will be used' : 'Password for new account'}
                  </p>
                </div>

                <div>
                  <label className="label">Courses * (Select one or more)</label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {courses.map((course) => (
                      <label key={course.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.courseIds.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.category}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.courseIds.length} course(s) selected
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ email: '', name: '', phone: '', city: '', state: '', password: '', courseIds: [] });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Create Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Registration Modal */}
      {showEditModal && editingRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Registration</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRegistration(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateRegistration} className="space-y-4">
                <div>
                  <label className="label">Student</label>
                  <input
                    type="text"
                    value={editingRegistration.user?.name}
                    className="input bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={editingRegistration.user?.email}
                    className="input bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Course</label>
                  <input
                    type="text"
                    value={editingRegistration.course?.title}
                    className="input bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Status *</label>
                  <select
                    value={editingRegistration.status}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, status: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingRegistration(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Update Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;
