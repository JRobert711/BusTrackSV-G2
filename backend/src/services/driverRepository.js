/**
 * Driver Repository
 *
 * Firestore data access for drivers collection.
 */

const { db } = require('../config/db');
const Driver = require('../models/Driver');
const { FieldValue } = require('firebase-admin').firestore;

class DriverRepository {
  constructor() {
    this.collection = db.collection('drivers');
  }

  _mapToModel(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    return new Driver({
      id: doc.id,
      name: data.name,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      status: data.status,
      experience: data.experience,
      assignedBus: data.assignedBus || null,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  _mapToDocument(driver, isUpdate = false) {
    const payload = driver.toDatabase(isUpdate);
    payload.updatedAt = FieldValue.serverTimestamp();
    if (!isUpdate) {
      payload.createdAt = FieldValue.serverTimestamp();
    }
    return payload;
  }

  async list(filters = {}) {
    try {
      let query = this.collection;

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters.assignedBus) {
        query = query.where('assignedBus', '==', filters.assignedBus);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in DriverRepository.list:', error);
      throw new Error(`Database error while listing drivers: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in DriverRepository.findById:', error);
      throw new Error(`Database error while finding driver: ${error.message}`);
    }
  }

  async create(driver) {
    try {
      const docRef = await this.collection.add(this._mapToDocument(driver, false));
      const createdDoc = await docRef.get();
      return this._mapToModel(createdDoc);
    } catch (error) {
      console.error('Firestore error in DriverRepository.create:', error);
      throw new Error(`Database error while creating driver: ${error.message}`);
    }
  }

  async update(driver) {
    try {
      if (!driver.id) {
        throw new Error('Driver ID is required for update');
      }

      const docRef = this.collection.doc(driver.id);
      const exists = await docRef.get();
      if (!exists.exists) {
        const notFound = new Error('Driver not found');
        notFound.status = 404;
        throw notFound;
      }

      await docRef.update(this._mapToDocument(driver, true));
      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in DriverRepository.update:', error);
      throw new Error(`Database error while updating driver: ${error.message}`);
    }
  }

  async remove(id) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        const notFound = new Error('Driver not found');
        notFound.status = 404;
        throw notFound;
      }
      await docRef.delete();
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in DriverRepository.remove:', error);
      throw new Error(`Database error while deleting driver: ${error.message}`);
    }
  }
}

const driverRepository = new DriverRepository();

module.exports = { driverRepository, DriverRepository };

