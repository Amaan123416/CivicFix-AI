const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllComplaints } = require('../controllers/complaintController');

const router = express.Router();

router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const complaints = await require('../models/Complaint').find().populate('citizen', 'name email role');

    const stats = {
      total: complaints.length,
      pending: complaints.filter((item) => item.status === 'Pending').length,
      inProgress: complaints.filter((item) => item.status === 'In Progress').length,
      resolved: complaints.filter((item) => item.status === 'Resolved').length,
      rejected: complaints.filter((item) => item.status === 'Rejected').length,
    };

    res.json({
      success: true,
      stats,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard',
      error: error.message,
    });
  }
});

router.get('/complaints', protect, adminOnly, getAllComplaints);

module.exports = router;
