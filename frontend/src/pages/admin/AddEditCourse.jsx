import { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';

const AddEditCourse = ({ course, onClose, onSave }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    price: '',
    category: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        instructor: course.instructor || '',
        duration: course.duration || '',
        price: course.price?.toString() || '',
        category: course.category || '',
        isActive: course.isActive !== false
      });
      if (course.imageUrl) {
        setImagePreview(getImageUrl(course.imageUrl));
      }
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (imageFile) data.append('image', imageFile);
      if (removeImage) data.append('removeImage', '1');
      await onSave(data);
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <FiX className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">{course ? 'Edit Course' : 'Add Course'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Instructor</label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input"
                placeholder="e.g. 10 weeks"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
                required
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                id="course-image-upload"
              />
              <button
                type="button"
                className="btn btn-secondary flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload className="w-4 h-4" /> Upload
              </button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded shadow border"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:text-red-600"
                    onClick={handleRemoveImage}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!imagePreview && (
                <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded border">
                  <FiImage className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              id="isActive"
            />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditCourse;
