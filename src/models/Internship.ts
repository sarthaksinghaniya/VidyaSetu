import mongoose, { Schema, Document } from 'mongoose'

export interface IInternship extends Document {
  employerId: string
  title: string
  description: string
  type: 'full_time' | 'part_time' | 'remote' | 'hybrid'
  sector: string
  location: string
  state: string
  district?: string
  stipend?: number
  duration: number
  positions: number
  requirements?: string
  skills: string[]
  benefits?: string[]
  applicationDeadline: Date
  startDate: Date
  isActive: boolean
  isPmScheme: boolean
  createdAt: Date
  updatedAt: Date
}

const InternshipSchema: Schema = new Schema({
  employerId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['full_time', 'part_time', 'remote', 'hybrid']
  },
  sector: {
    type: String,
    required: true,
    enum: ['technology', 'healthcare', 'education', 'agriculture', 'manufacturing', 'retail', 'finance', 'government', 'other']
  },
  location: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String
  },
  stipend: {
    type: Number
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  positions: {
    type: Number,
    required: true,
    min: 1
  },
  requirements: {
    type: String
  },
  skills: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  applicationDeadline: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPmScheme: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const Internship = mongoose.model<IInternship>('Internship', InternshipSchema)