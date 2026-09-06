const mongoose = require('mongoose');

const automationErrorSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    complaintId: {
      type: String,
      required: true,
    },
    failedModule: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AutomationError', automationErrorSchema);
