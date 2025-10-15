import mongoose, { Schema, Document } from 'mongoose'

export interface IEmployer extends Document {
  userId: string
  companyName: string
  gstin?: string
  pan?: string
  phone: string
  address: string
  state: string
  district: string
  sector: string
  description?: string
  website?: string
  companySize?: string
  isVerified: boolean
  verificationDocuments?: string[]
  createdAt: Date
  updatedAt: Date
}

const EmployerSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  gstin: {
    type: String,
    unique: true,
    sparse: true
  },
  pan: {
    type: String
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true,
    enum: ['technology', 'healthcare', 'education', 'agriculture', 'manufacturing', 'retail', 'finance', 'government', 'other']
  },
  description: {
    type: String
  },
  website: {
    type: String
  },
  companySize: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String
  }]
}, {
  timestamps: true
})

export const Employer = mongoose.model<IEmployer>('Employer', EmployerSchema)