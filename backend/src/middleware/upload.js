const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/items');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `item-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
  }
};

// File filter for Excel files
const excelFilter = (req, file, cb) => {
  const allowedTypes = /xlsx|xls/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (extname || mimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'), false);
  }
};

// Upload configurations
const uploadItemImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Courses upload
const courseUploadDir = path.join(__dirname, '../../uploads/courses');
if (!fs.existsSync(courseUploadDir)) {
  fs.mkdirSync(courseUploadDir, { recursive: true });
}
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, courseUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `course-${uniqueSuffix}${ext}`);
  }
});

// Store logo upload
const storeUploadDir = path.join(__dirname, '../../uploads/store');
if (!fs.existsSync(storeUploadDir)) {
  fs.mkdirSync(storeUploadDir, { recursive: true });
}
const storeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storeUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `item-${uniqueSuffix}${ext}`);
  }
});

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: excelFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Delete file utility
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Get full path for uploaded file
const getUploadPath = (filename) => {
  return path.join(uploadDir, filename);
};

module.exports = {
  uploadItemImage,
  uploadCourseImage: multer({ storage: courseStorage, fileFilter: imageFilter }),
  uploadStoreImage: multer({ storage: storeStorage, fileFilter: imageFilter }),
  uploadExcel,
  deleteFile,
  getUploadPath,
  uploadDir
};
