/**
 * Notification Service
 *
 * Business layer for notification CRUD and read flags.
 */

const Notification = require('../models/Notification');
const { notificationRepository } = require('./notificationRepository');

class NotificationService {
  async listNotifications(options = {}) {
    return notificationRepository.list(options);
  }

  async getNotificationById(id) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      const error = new Error('Notification not found');
      error.status = 404;
      throw error;
    }
    return notification;
  }

  async createNotification(data) {
    const notification = new Notification(data);
    return notificationRepository.create(notification);
  }

  async markRead(id, read = true) {
    return notificationRepository.markRead(id, read);
  }

  async deleteNotification(id) {
    await notificationRepository.remove(id);
  }
}

module.exports = new NotificationService();

