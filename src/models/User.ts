import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email?: string
  password: string
  name?: string
  role: 'student' | 'employer' | 'admin'
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  mobileNumber: string
  otp?: string
  otpExpires?: Date
  isVerified?: boolean
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'employer', 'admin'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const User = mongoose.model<IUser>('User', UserSchema)