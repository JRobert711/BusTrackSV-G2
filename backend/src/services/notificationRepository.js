/**
 * Notification Repository
 *
 * Firestore data access for notifications collection.
 */

const { db } = require('../config/db');
const Notification = require('../models/Notification');
const { FieldValue } = require('firebase-admin').firestore;

class NotificationRepository {
  constructor() {
    this.collection = db.collection('notifications');
  }

  _mapToModel(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    return new Notification({
      id: doc.id,
      type: data.type,
      busId: data.busId,
      busPlate: data.busPlate,
      route: data.route,
      fromUserId: data.fromUserId,
      fromName: data.fromName,
      fromRole: data.fromRole,
      content: data.content,
      severity: data.severity,
      metadata: data.metadata,
      read: data.read,
      timestamp: data.timestamp?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  _mapToDocument(notification, isUpdate = false) {
    const payload = notification.toDatabase(isUpdate);
    payload.updatedAt = FieldValue.serverTimestamp();
    if (!isUpdate) {
      payload.createdAt = FieldValue.serverTimestamp();
    }
    if (!notification.timestamp) {
      payload.timestamp = FieldValue.serverTimestamp();
    }
    return payload;
  }

  async list(filters = {}) {
    try {
      let query = this.collection.orderBy('timestamp', 'desc');

      if (typeof filters.read === 'boolean') {
        query = query.where('read', '==', filters.read);
      }
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      if (filters.limit) {
        query = query.limit(Math.min(filters.limit, 100));
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in NotificationRepository.list:', error);
      throw new Error(`Database error while listing notifications: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in NotificationRepository.findById:', error);
      throw new Error(`Database error while finding notification: ${error.message}`);
    }
  }

  async create(notification) {
    try {
      const docRef = await this.collection.add(this._mapToDocument(notification, false));
      const createdDoc = await docRef.get();
      return this._mapToModel(createdDoc);
    } catch (error) {
      console.error('Firestore error in NotificationRepository.create:', error);
      throw new Error(`Database error while creating notification: ${error.message}`);
    }
  }

  async markRead(id, read = true) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        const notFound = new Error('Notification not found');
        notFound.status = 404;
        throw notFound;
      }

      await docRef.update({
        read,
        readAt: read ? FieldValue.serverTimestamp() : null,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      return this._mapToModel(updated);
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in NotificationRepository.markRead:', error);
      throw new Error(`Database error while updating notification: ${error.message}`);
    }
  }

  async remove(id) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        const notFound = new Error('Notification not found');
        notFound.status = 404;
        throw notFound;
      }
      await docRef.delete();
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in NotificationRepository.remove:', error);
      throw new Error(`Database error while deleting notification: ${error.message}`);
    }
  }
}

const notificationRepository = new NotificationRepository();

module.exports = { notificationRepository, NotificationRepository };

