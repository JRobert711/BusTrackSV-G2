const notificationService = require('../services/notificationService');

async function listNotifications(req, res, next) {
  try {
    const { read, type, limit } = req.query;
    const parsedRead = typeof read === 'string' ? read === 'true' ? true : read === 'false' ? false : undefined : undefined;
    const notifications = await notificationService.listNotifications({
      read: parsedRead,
      type,
      limit: limit ? Number(limit) : undefined
    });
    res.status(200).json({ data: notifications.map(n => n.toJSON()) });
  } catch (error) {
    next(error);
  }
}

async function createNotification(req, res, next) {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json({ notification: notification.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    const { read } = req.body || {};
    const updated = await notificationService.markRead(id, read !== false);
    res.status(200).json({ notification: updated.toJSON() });
  } catch (error) {
    next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    await notificationService.deleteNotification(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification
};

