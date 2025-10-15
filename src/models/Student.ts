import mongoose, { Schema, Document } from 'mongoose'

export interface IStudent extends Document {
  userId: string
  aadhaar?: string
  phone: string
  address: string
  state: string
  district: string
  language: string
  resumeUrl?: string
  profileComplete: boolean
  education: IEducation[]
  skills: string[]
  preferences: IPreferences
  createdAt: Date
  updatedAt: Date
}

export interface IEducation {
  institution: string
  degree: string
  field: string
  startYear: number
  endYear?: number
  grade?: string
}

export interface IPreferences {
  preferredSectors: string[]
  preferredLocations: string[]
  preferredTypes: string[]
  minStipend?: number
  maxDistance?: number
}

const EducationSchema: Schema = new Schema({
  institution: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  startYear: {
    type: Number,
    required: true
  },
  endYear: {
    type: Number
  },
  grade: {
    type: String
  }
})

const PreferencesSchema: Schema = new Schema({
  preferredSectors: [{
    type: String
  }],
  preferredLocations: [{
    type: String
  }],
  preferredTypes: [{
    type: String,
    enum: ['full_time', 'part_time', 'remote', 'hybrid']
  }],
  minStipend: {
    type: Number
  },
  maxDistance: {
    type: Number
  }
})

const StudentSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  aadhaar: {
    type: String,
    unique: true,
    sparse: true
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
  language: {
    type: String,
    default: 'english',
    enum: ['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi']
  },
  resumeUrl: {
    type: String
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  education: [EducationSchema],
  skills: [{
    type: String
  }],
  preferences: {
    type: PreferencesSchema,
    default: {
      preferredSectors: [],
      preferredLocations: [],
      preferredTypes: []
    }
  }
}, {
  timestamps: true
})

export const Student = mongoose.model<IStudent>('Student', StudentSchema)