/**
 * Driver Model
 *
 * Minimal validation + mapping helpers for Firestore.
 */

class Driver {
  constructor(data = {}) {
    if (!data || typeof data !== 'object') {
      throw new Error('Driver data must be an object');
    }

    this.id = data.id ? String(data.id) : undefined;
    this.name = Driver.#requireString(data.name, 'name');
    this.phone = data.phone ? String(data.phone) : '';
    this.licenseNumber = Driver.#requireString(data.licenseNumber, 'licenseNumber');
    this.status = Driver.#validateStatus(data.status);
    this.experience = Number.isFinite(data.experience) ? data.experience : 0;
    this.assignedBus = data.assignedBus ? String(data.assignedBus) : null;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : null;
    this.updatedAt = data.updatedAt instanceof Date ? data.updatedAt : null;
  }

  static #requireString(value, field) {
    if (!value || typeof value !== 'string') {
      throw new Error(`${field} is required and must be a string`);
    }
    return value.trim();
  }

  static #validateStatus(status) {
    const allowed = ['active', 'inactive', 'on_leave'];
    if (!status) return 'active';
    if (!allowed.includes(status)) {
      throw new Error(`status must be one of: ${allowed.join(', ')}`);
    }
    return status;
  }

  touch() {
    this.updatedAt = new Date();
  }

  toDatabase(isUpdate = false) {
    const payload = {
      name: this.name,
      phone: this.phone,
      licenseNumber: this.licenseNumber,
      status: this.status,
      experience: this.experience,
      assignedBus: this.assignedBus,
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
      name: this.name,
      phone: this.phone,
      licenseNumber: this.licenseNumber,
      status: this.status,
      experience: this.experience,
      assignedBus: this.assignedBus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Driver;

