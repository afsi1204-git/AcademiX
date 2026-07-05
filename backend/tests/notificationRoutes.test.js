const request = require('supertest');
const express = require('express');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'student-user' };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

jest.mock('../models/Notification', () => ({
  find: jest.fn(),
}));

const Notification = require('../models/Notification');
const notificationRoutes = require('../routes/notificationRoutes');

describe('notification routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns student alerts for the authenticated user', async () => {
    const queryChain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([
        {
          _id: 'alert-1',
          title: 'New assignment posted',
          message: 'Check your latest update',
          type: 'course-update',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          user: { _id: 'teacher-1', name: 'Jane Doe' },
          relatedId: { _id: 'course-1', title: 'Intro to React' },
          relatedModel: 'Course',
        },
      ]),
    };

    Notification.find.mockReturnValue(queryChain);

    const app = express();
    app.use('/api/notifications', notificationRoutes);

    const response = await request(app).get('/api/notifications/student-alerts');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('New assignment posted');
  });
});
