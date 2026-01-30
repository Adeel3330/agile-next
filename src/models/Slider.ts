import mongoose, { Schema, Document } from 'mongoose';

export interface ISlider extends Document {
  title: string;
  description?: string;
  file: string; // URL to image or video
  fileType: 'image' | 'video'; // Type of file
  seoTitle?: string;
  seoContent?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // For soft delete
}

const SliderSchema = new Schema<ISlider>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
      type: String,
      trim: true
    },
    file: {
      type: String,
      required: [true, 'Please provide a file'],
      trim: true
    },
    fileType: {
      type: String,
      enum: ['image', 'video'],
      required: [true, 'Please specify file type'],
      default: 'image'
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'SEO title cannot be more than 200 characters']
    },
    seoContent: {
      type: String,
      trim: true,
      maxlength: [500, 'SEO content cannot be more than 500 characters']
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    deleted_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Index for soft delete queries
SliderSchema.index({ deleted_at: 1 });

// Method to soft delete
SliderSchema.methods.softDelete = function() {
  this.deleted_at = new Date();
  return this.save();
};

// Method to restore
SliderSchema.methods.restore = function() {
  this.deleted_at = null;
  return this.save();
};

const Slider =
  mongoose.models.Slider || mongoose.model<ISlider>('Slider', SliderSchema);

export default Slider;
