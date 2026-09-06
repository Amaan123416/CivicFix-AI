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

    // Automation & SLA tracking fields (controlled by backend source of truth)
    department: {
      type: String,
      enum: [
        'Public Works / Roads Department',
        'Sanitation / Waste Management Department',
        'Electrical / Streetlight Department',
        'Water & Sewerage Department',
        'Traffic Management Department',
        'Municipal Infrastructure Department',
        'General Civic Services Department',
      ],
    },
    assignedAt: Date,
    slaDueAt: Date,
    escalationLevel: {
      type: Number,
      default: 0,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    possibleDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    aiReviewRequired: {
      type: Boolean,
      default: false,
    },
    notificationHistory: [
      {
        notificationKey: String,
        notificationType: String,
        status: String,
        sentAt: Date,
        success: Boolean,
        errorMessage: String,
      },
    ],
    resolvedAt: Date,
    rejectedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

complaintSchema.virtual('complaintId').get(function () {
  return `CIV-${this._id.toString()}`;
});

module.exports = mongoose.model('Complaint', complaintSchema);
