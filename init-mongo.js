// MongoDB initialization script
db = db.getSiblingDB('vidya-setu');

// Create collections
db.createCollection('users');
db.createCollection('students');
db.createCollection('employers');
db.createCollection('internships');
db.createCollection('applications');
db.createCollection('analytics');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.students.createIndex({ "userId": 1 }, { unique: true });
db.students.createIndex({ "aadhaar": 1 }, { unique: true, sparse: true });
db.employers.createIndex({ "userId": 1 }, { unique: true });
db.employers.createIndex({ "gstin": 1 }, { unique: true, sparse: true });
db.internships.createIndex({ "employerId": 1 });
db.internships.createIndex({ "sector": 1 });
db.internships.createIndex({ "state": 1 });
db.internships.createIndex({ "isActive": 1 });
db.applications.createIndex({ "studentId": 1, "internshipId": 1 }, { unique: true });
db.applications.createIndex({ "studentId": 1 });
db.applications.createIndex({ "internshipId": 1 });
db.applications.createIndex({ "status": 1 });
db.analytics.createIndex({ "date": 1 });
db.analytics.createIndex({ "state": 1 });
db.analytics.createIndex({ "sector": 1 });

print('Database initialized successfully');