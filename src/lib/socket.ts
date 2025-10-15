import { Server } from 'socket.io';

interface NotificationData {
  type: 'application_status' | 'new_internship' | 'deadline_reminder' | 'interview_scheduled' | 'system';
  title: string;
  message: string;
  userId?: string;
  roleId?: string;
  data?: any;
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user-specific room
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join role-specific room
    socket.on('join_role_room', (role: string) => {
      socket.join(`role_${role}`);
      console.log(`User with role ${role} joined role room`);
    });

    // Handle application status updates
    socket.on('application_update', (data: {
      applicationId: string;
      studentId: string;
      employerId: string;
      status: string;
      message?: string;
    }) => {
      // Notify student
      io.to(`user_${data.studentId}`).emit('notification', {
        type: 'application_status',
        title: 'Application Status Update',
        message: data.message || `Your application status has been updated to ${data.status}`,
        data: { applicationId: data.applicationId, status: data.status }
      });

      // Notify employer
      io.to(`user_${data.employerId}`).emit('notification', {
        type: 'application_status',
        title: 'Application Update',
        message: `Application status updated to ${data.status}`,
        data: { applicationId: data.applicationId, status: data.status }
      });
    });

    // Handle new internship postings
    socket.on('new_internship', (data: {
      internshipId: string;
      employerId: string;
      title: string;
      sector: string;
      state: string;
    }) => {
      // Notify all students in the same state
      io.to(`role_student`).emit('notification', {
        type: 'new_internship',
        title: 'New Internship Posted',
        message: `New ${data.sector} internship available in ${data.state}: ${data.title}`,
        data: { internshipId: data.internship, sector: data.sector, state: data.state }
      });
    });

    // Handle interview scheduling
    socket.on('interview_scheduled', (data: {
      applicationId: string;
      studentId: string;
      employerId: string;
      interviewDate: string;
      internshipTitle: string;
    }) => {
      // Notify student
      io.to(`user_${data.studentId}`).emit('notification', {
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Interview scheduled for ${data.internshipTitle} on ${new Date(data.interviewDate).toLocaleDateString()}`,
        data: { applicationId: data.applicationId, interviewDate: data.interviewDate }
      });
    });

    // Handle deadline reminders
    socket.on('deadline_reminder', (data: {
      internshipId: string;
      title: string;
      deadline: string;
      studentIds: string[];
    }) => {
      data.studentIds.forEach(studentId => {
        io.to(`user_${studentId}`).emit('notification', {
          type: 'deadline_reminder',
          title: 'Application Deadline Reminder',
          message: `Deadline approaching for ${data.title}: ${new Date(data.deadline).toLocaleDateString()}`,
          data: { internshipId: data.internshipId, deadline: data.deadline }
        });
      });
    });

    // Handle system notifications
    socket.on('system_notification', (data: NotificationData) => {
      if (data.userId) {
        io.to(`user_${data.userId}`).emit('notification', data);
      } else if (data.roleId) {
        io.to(`role_${data.roleId}`).emit('notification', data);
      } else {
        // Broadcast to all connected users
        io.emit('notification', data);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('notification', {
      type: 'system',
      title: 'Connected to Vidya Setu',
      message: 'Real-time notifications enabled',
      timestamp: new Date().toISOString(),
    });
  });
};