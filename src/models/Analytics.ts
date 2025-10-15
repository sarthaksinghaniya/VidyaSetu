import mongoose, { Schema, Document } from 'mongoose'

export interface IAnalytics extends Document {
  date: Date
  state?: string
  district?: string
  sector?: string
  totalStudents: number
  totalEmployers: number
  totalInternships: number
  totalApplications: number
  acceptedApplications: number
  completedInternships: number
  averageStipend?: number
  topSkills: string[]
  genderDistribution?: {
    male: number
    female: number
    other: number
  }
  ageDistribution?: {
    '18-22': number
    '23-26': number
    '27-30': number
  }
}

const AnalyticsSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  state: {
    type: String
  },
  district: {
    type: String
  },
  sector: {
    type: String
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalEmployers: {
    type: Number,
    default: 0
  },
  totalInternships: {
    type: Number,
    default: 0
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  acceptedApplications: {
    type: Number,
    default: 0
  },
  completedInternships: {
    type: Number,
    default: 0
  },
  averageStipend: {
    type: Number
  },
  topSkills: [{
    type: String
  }],
  genderDistribution: {
    male: {
      type: Number,
      default: 0
    },
    female: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  ageDistribution: {
    '18-22': {
      type: Number,
      default: 0
    },
    '23-26': {
      type: Number,
      default: 0
    },
    '27-30': {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

AnalyticsSchema.index({ date: 1, state: 1, district: 1, sector: 1 })

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema)