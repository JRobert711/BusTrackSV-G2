/**
 * Notification Model
 *
 * Represents alerts/messages related to buses/users.
 */

class Notification {
  constructor(data = {}) {
    if (!data || typeof data !== 'object') {
      throw new Error('Notification data must be an object');
    }

    this.id = data.id ? String(data.id) : undefined;
    this.type = Notification.#validateType(data.type);
    this.busId = data.busId ? String(data.busId) : null;
    this.busPlate = data.busPlate ? String(data.busPlate) : null;
    this.route = data.route ? String(data.route) : null;
    this.fromUserId = data.fromUserId ? String(data.fromUserId) : null;
    this.fromName = data.fromName ? String(data.fromName) : null;
    this.fromRole = data.fromRole ? String(data.fromRole) : null;
    this.content = Notification.#requireString(data.content, 'content');
    this.severity = Notification.#validateSeverity(data.severity);
    this.metadata = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
    this.read = Boolean(data.read);
    this.timestamp = data.timestamp instanceof Date ? data.timestamp : null;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : null;
    this.updatedAt = data.updatedAt instanceof Date ? data.updatedAt : null;
  }

  static #requireString(value, field) {
    if (!value || typeof value !== 'string') {
      throw new Error(`${field} is required and must be a string`);
    }
    return value.trim();
  }

  static #validateType(type) {
    const allowed = ['notification', 'warning', 'alert'];
    if (!type) return 'notification';
    if (!allowed.includes(type)) {
      throw new Error(`type must be one of: ${allowed.join(', ')}`);
    }
    return type;
  }

  static #validateSeverity(severity) {
    const allowed = ['info', 'warning', 'critical'];
    if (!severity) return 'info';
    if (!allowed.includes(severity)) {
      throw new Error(`severity must be one of: ${allowed.join(', ')}`);
    }
    return severity;
  }

  touch() {
    this.updatedAt = new Date();
  }

  toDatabase(isUpdate = false) {
    const payload = {
      type: this.type,
      busId: this.busId,
      busPlate: this.busPlate,
      route: this.route,
      fromUserId: this.fromUserId,
      fromName: this.fromName,
      fromRole: this.fromRole,
      content: this.content,
      severity: this.severity,
      metadata: this.metadata,
      read: this.read,
      timestamp: this.timestamp || null,
      updatedAt: this.updatedAt || null
    };

    if (!isUpdate) {
      payload.createdAt = this.createdAt || null;
    }

    return payload;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      busId: this.busId,
      busPlate: this.busPlate,
      route: this.route,
      fromUserId: this.fromUserId,
      fromName: this.fromName,
      fromRole: this.fromRole,
      content: this.content,
      severity: this.severity,
      metadata: this.metadata,
      read: this.read,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Notification;

