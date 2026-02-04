import mongoose, { Schema, Document } from 'mongoose';

export interface ICareer extends Document {
  title: string;
  department?: string;
  location?: string;
  type?: string;
  status: 'open' | 'closed' | 'draft';
  description?: string;
  requirements?: string;
  created_at: Date;
  updated_at: Date;
}

const CareerSchema = new Schema<ICareer>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [150, 'Title cannot be more than 150 characters']
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot be more than 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Location cannot be more than 150 characters']
    },
    type: {
      type: String,
      trim: true,
      maxlength: [50, 'Type cannot be more than 50 characters']
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open'
    },
    description: {
      type: String,
      trim: true
    },
    requirements: {
      type: String,
      trim: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

CareerSchema.index({
  title: 'text',
  department: 'text',
  location: 'text'
});

const Career =
  mongoose.models.Career || mongoose.model<ICareer>('Career', CareerSchema);

export default Career;

