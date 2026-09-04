const express = require('express');
const {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  getPublicSummary,
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createComplaint);
router.get('/my', protect, getUserComplaints);
router.get('/public/summary', getPublicSummary);
router.get('/:id', protect, getComplaintById);
router.get('/', protect, adminOnly, getAllComplaints);
router.patch('/:id/status', protect, adminOnly, updateComplaintStatus);

module.exports = router;
