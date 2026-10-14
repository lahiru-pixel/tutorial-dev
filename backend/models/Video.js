const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    youtube_url: {
      type: String,
      required: true,
      trim: true,
    },
    order_index: {
      type: Number,
      default: 0,
    },
    duration_text: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (ret.course_id && typeof ret.course_id === 'object' && ret.course_id._id) {
          ret.course_id = ret.course_id._id.toString();
        } else if (ret.course_id) {
          ret.course_id = ret.course_id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Video', videoSchema);
