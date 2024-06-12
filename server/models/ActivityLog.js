const { Schema, model } = require('mongoose');

const activityLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Schema.Types.Mixed, required: true }
});

const ActivityLog = model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;