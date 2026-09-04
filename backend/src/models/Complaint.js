const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Road Damage',
        'Waste Management',
        'Streetlight',
        'Water/Sewerage',
        'Traffic',
        'Public Infrastructure',
        'Other',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    aiAnalysis: {
      category: { type: String, default: 'Other' },
      priority: { type: String, default: 'Medium' },
      confidence: { type: Number, default: 0 },
      recommendation: { type: String, default: '' },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
