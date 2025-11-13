/**
 * Trip Repository
 *
 * Repository pattern for Trip entity.
 * Maps GTFS Trip models ↔ Firestore cleanly.
 */

const { db } = require('../../config/db');
const { Trip } = require('../../models/gtfs');
const { FieldValue } = require('firebase-admin').firestore;

/**
 * FirestoreTripRepository
 *
 * Firestore implementation for Trip repository.
 */
class FirestoreTripRepository {
  constructor() {
    this.collection = db.collection(Trip.collection());
  }

  /**
   * Map Firestore document to Trip domain model
   * @private
   */
  _mapToModel(doc) {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return new Trip({
      id: doc.id,
      routeId: data.routeId,
      serviceId: data.serviceId,
      headsign: data.headsign,
      shortName: data.shortName,
      directionId: data.directionId,
      blockId: data.blockId,
      shapeId: data.shapeId,
      wheelchairAccessible: data.wheelchairAccessible,
      bikesAllowed: data.bikesAllowed,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  /**
   * Map Trip domain model to Firestore document data
   * @private
   */
  _mapToDocument(trip, isUpdate = false) {
    const data = {
      routeId: trip.routeId,
      serviceId: trip.serviceId,
      headsign: trip.headsign,
      shortName: trip.shortName,
      directionId: trip.directionId,
      blockId: trip.blockId,
      shapeId: trip.shapeId,
      wheelchairAccessible: trip.wheelchairAccessible,
      bikesAllowed: trip.bikesAllowed,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      data.createdAt = FieldValue.serverTimestamp();
    }

    return data;
  }

  /**
   * Find a trip by ID
   * @param {string} id - Trip ID
   * @returns {Promise<Trip|null>}
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in findById:', error);
      throw new Error(`Database error while finding trip by ID: ${error.message}`);
    }
  }

  /**
   * Find trips by route
   * @param {string} routeId - Route ID
   * @returns {Promise<Trip[]>}
   */
  async findByRoute(routeId) {
    try {
      const snapshot = await this.collection
        .where('routeId', '==', routeId)
        .get();

      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in findByRoute:', error);
      throw new Error(`Database error while finding trips by route: ${error.message}`);
    }
  }

  /**
   * Find trips by service
   * @param {string} serviceId - Service ID
   * @returns {Promise<Trip[]>}
   */
  async findByService(serviceId) {
    try {
      const snapshot = await this.collection
        .where('serviceId', '==', serviceId)
        .get();

      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in findByService:', error);
      throw new Error(`Database error while finding trips by service: ${error.message}`);
    }
  }

  /**
   * List trips with optional filters
   * @param {Object} options - Query options
   * @returns {Promise<Trip[]>}
   */
  async list(options = {}) {
    try {
      let query = this.collection;

      if (options.routeId) {
        query = query.where('routeId', '==', options.routeId);
      }

      if (options.serviceId) {
        query = query.where('serviceId', '==', options.serviceId);
      }

      if (options.directionId) {
        query = query.where('directionId', '==', options.directionId);
      }

      const limit = options.limit || 100;
      query = query.limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in list:', error);
      throw new Error(`Database error while listing trips: ${error.message}`);
    }
  }

  /**
   * Create a new trip
   * @param {Trip} trip - Trip domain model
   * @returns {Promise<Trip>}
   */
  async create(trip) {
    try {
      const docData = this._mapToDocument(trip, false);
      const docRef = await this.collection.add(docData);
      const createdDoc = await docRef.get();
      return this._mapToModel(createdDoc);
    } catch (error) {
      console.error('Firestore error in create:', error);
      throw new Error(`Database error while creating trip: ${error.message}`);
    }
  }

  /**
   * Update an existing trip
   * @param {Trip} trip - Trip domain model with ID
   * @returns {Promise<Trip>}
   */
  async update(trip) {
    try {
      if (!trip.id) {
        throw new Error('Trip ID is required for update');
      }

      const docRef = this.collection.doc(trip.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const error = new Error('Trip not found');
        error.status = 404;
        throw error;
      }

      const updateData = this._mapToDocument(trip, true);
      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in update:', error);
      throw new Error(`Database error while updating trip: ${error.message}`);
    }
  }

  /**
   * Delete a trip by ID
   * @param {string} id - Trip ID
   * @returns {Promise<void>}
   */
  async remove(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        const error = new Error('Trip not found');
        error.status = 404;
        throw error;
      }

      await this.collection.doc(id).delete();
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in remove:', error);
      throw new Error(`Database error while deleting trip: ${error.message}`);
    }
  }
}

module.exports = {
  FirestoreTripRepository,
  tripRepository: new FirestoreTripRepository()
};

