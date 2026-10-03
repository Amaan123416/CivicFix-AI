const express = require('express');
const multer = require('multer');

const {
  createComplaint,
  uploadComplaintImage,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  getPublicSummary,
} = require('../controllers/complaintController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Temporary storage for uploaded images before sending them to Cloudinary
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload complaint evidence image
router.post(
  '/upload-image',
  protect,
  upload.single('image'),
  uploadComplaintImage
);

// Create complaint
router.post('/', protect, createComplaint);

// Get current user's complaints
router.get('/my', protect, getUserComplaints);

// Public summary
router.get('/public/summary', getPublicSummary);

// Get complaint by ID
router.get('/:id', protect, getComplaintById);

// Get all complaints (admin)
router.get('/', protect, adminOnly, getAllComplaints);

// Update complaint status (admin)
router.patch('/:id/status', protect, adminOnly, updateComplaintStatus);

module.exports = router;