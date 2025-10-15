import mongoose, { Schema, Document } from 'mongoose'

export interface IApplication extends Document {
  studentId: string
  internshipId: string
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted' | 'completed' | 'withdrawn'
  matchScore?: number
  coverLetter?: string
  appliedAt: Date
  updatedAt: Date
  interviewDate?: Date
  feedback?: string
  employerNotes?: string
}

const ApplicationSchema: Schema = new Schema({
  studentId: {
    type: String,
    required: true
  },
  internshipId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'accepted', 'completed', 'withdrawn'],
    default: 'pending'
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  coverLetter: {
    type: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  interviewDate: {
    type: Date
  },
  feedback: {
    type: String
  },
  employerNotes: {
    type: String
  }
}, {
  timestamps: true
})

ApplicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true })

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema)