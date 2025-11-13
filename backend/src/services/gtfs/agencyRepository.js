/**
 * Agency Repository
 *
 * Repository pattern for Agency entity.
 * Maps GTFS Agency models ↔ Firestore cleanly.
 */

const { db } = require('../../config/db');
const { Agency } = require('../../models/gtfs');
const { FieldValue } = require('firebase-admin').firestore;

/**
 * FirestoreAgencyRepository
 *
 * Firestore implementation for Agency repository.
 */
class FirestoreAgencyRepository {
  constructor() {
    this.collection = db.collection(Agency.collection());
  }

  /**
   * Map Firestore document to Agency domain model
   * @private
   */
  _mapToModel(doc) {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return new Agency({
      id: doc.id,
      name: data.name,
      url: data.url,
      timezone: data.timezone,
      lang: data.lang,
      phone: data.phone,
      fareUrl: data.fareUrl,
      email: data.email,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  /**
   * Map Agency domain model to Firestore document data
   * @private
   */
  _mapToDocument(agency, isUpdate = false) {
    const data = {
      name: agency.name,
      url: agency.url,
      timezone: agency.timezone,
      lang: agency.lang,
      phone: agency.phone,
      fareUrl: agency.fareUrl,
      email: agency.email,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      data.createdAt = FieldValue.serverTimestamp();
    }

    return data;
  }

  /**
   * Find an agency by ID
   * @param {string} id - Agency ID
   * @returns {Promise<Agency|null>}
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in findById:', error);
      throw new Error(`Database error while finding agency by ID: ${error.message}`);
    }
  }

  /**
   * List all agencies
   * @returns {Promise<Agency[]>}
   */
  async list() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in list:', error);
      throw new Error(`Database error while listing agencies: ${error.message}`);
    }
  }

  /**
   * Create a new agency
   * @param {Agency} agency - Agency domain model
   * @returns {Promise<Agency>}
   */
  async create(agency) {
    try {
      const docData = this._mapToDocument(agency, false);
      const docRef = await this.collection.add(docData);
      const createdDoc = await docRef.get();
      return this._mapToModel(createdDoc);
    } catch (error) {
      console.error('Firestore error in create:', error);
      throw new Error(`Database error while creating agency: ${error.message}`);
    }
  }

  /**
   * Update an existing agency
   * @param {Agency} agency - Agency domain model with ID
   * @returns {Promise<Agency>}
   */
  async update(agency) {
    try {
      if (!agency.id) {
        throw new Error('Agency ID is required for update');
      }

      const docRef = this.collection.doc(agency.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const error = new Error('Agency not found');
        error.status = 404;
        throw error;
      }

      const updateData = this._mapToDocument(agency, true);
      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in update:', error);
      throw new Error(`Database error while updating agency: ${error.message}`);
    }
  }

  /**
   * Delete an agency by ID
   * @param {string} id - Agency ID
   * @returns {Promise<void>}
   */
  async remove(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        const error = new Error('Agency not found');
        error.status = 404;
        throw error;
      }

      await this.collection.doc(id).delete();
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in remove:', error);
      throw new Error(`Database error while deleting agency: ${error.message}`);
    }
  }
}

module.exports = {
  FirestoreAgencyRepository,
  agencyRepository: new FirestoreAgencyRepository()
};

