/**
 * Stop Repository
 *
 * Repository pattern for Stop entity.
 * Maps GTFS Stop models ↔ Firestore cleanly.
 */

const { db } = require('../../config/db');
const { Stop } = require('../../models/gtfs');
const { FieldValue } = require('firebase-admin').firestore;

/**
 * FirestoreStopRepository
 *
 * Firestore implementation for Stop repository.
 */
class FirestoreStopRepository {
  constructor() {
    this.collection = db.collection(Stop.collection());
  }

  /**
   * Map Firestore document to Stop domain model
   * @private
   */
  _mapToModel(doc) {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return new Stop({
      id: doc.id,
      code: data.code,
      name: data.name,
      desc: data.desc,
      lat: data.lat,
      lng: data.lng,
      zoneId: data.zoneId,
      url: data.url,
      locationType: data.locationType,
      parentStation: data.parentStation,
      timezone: data.timezone,
      wheelchairBoarding: data.wheelchairBoarding,
      platformCode: data.platformCode,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  /**
   * Map Stop domain model to Firestore document data
   * @private
   */
  _mapToDocument(stop, isUpdate = false) {
    const data = {
      code: stop.code,
      name: stop.name,
      desc: stop.desc,
      lat: stop.lat,
      lng: stop.lng,
      zoneId: stop.zoneId,
      url: stop.url,
      locationType: stop.locationType,
      parentStation: stop.parentStation,
      timezone: stop.timezone,
      wheelchairBoarding: stop.wheelchairBoarding,
      platformCode: stop.platformCode,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      data.createdAt = FieldValue.serverTimestamp();
    }

    return data;
  }

  /**
   * Find a stop by ID
   * @param {string} id - Stop ID
   * @returns {Promise<Stop|null>}
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in findById:', error);
      throw new Error(`Database error while finding stop by ID: ${error.message}`);
    }
  }

  /**
   * Find stops by location (within radius)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Promise<Stop[]>}
   */
  async findNearby(lat, lng, radiusKm = 1) {
    try {
      // Simple bounding box query
      // For production, consider using geohash or GeoFirestore
      const latDelta = radiusKm / 111; // Approx 111km per degree
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      const snapshot = await this.collection
        .where('lat', '>=', lat - latDelta)
        .where('lat', '<=', lat + latDelta)
        .get();

      // Filter by longitude in memory (Firestore limitation)
      const stops = snapshot.docs
        .map(doc => this._mapToModel(doc))
        .filter(stop => {
          const lngDiff = Math.abs(stop.lng - lng);
          return lngDiff <= lngDelta;
        });

      return stops;
    } catch (error) {
      console.error('Firestore error in findNearby:', error);
      throw new Error(`Database error while finding nearby stops: ${error.message}`);
    }
  }

  /**
   * List stops with optional filters
   * @param {Object} options - Query options
   * @returns {Promise<Stop[]>}
   */
  async list(options = {}) {
    try {
      let query = this.collection;

      if (options.locationType) {
        query = query.where('locationType', '==', options.locationType);
      }

      if (options.parentStation) {
        query = query.where('parentStation', '==', options.parentStation);
      }

      const limit = options.limit || 100;
      query = query.limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in list:', error);
      throw new Error(`Database error while listing stops: ${error.message}`);
    }
  }

  /**
   * Create a new stop
   * @param {Stop} stop - Stop domain model
   * @returns {Promise<Stop>}
   */
  async create(stop) {
    try {
      const docData = this._mapToDocument(stop, false);
      const docRef = await this.collection.add(docData);
      const createdDoc = await docRef.get();
      return this._mapToModel(createdDoc);
    } catch (error) {
      console.error('Firestore error in create:', error);
      throw new Error(`Database error while creating stop: ${error.message}`);
    }
  }

  /**
   * Update an existing stop
   * @param {Stop} stop - Stop domain model with ID
   * @returns {Promise<Stop>}
   */
  async update(stop) {
    try {
      if (!stop.id) {
        throw new Error('Stop ID is required for update');
      }

      const docRef = this.collection.doc(stop.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const error = new Error('Stop not found');
        error.status = 404;
        throw error;
      }

      const updateData = this._mapToDocument(stop, true);
      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in update:', error);
      throw new Error(`Database error while updating stop: ${error.message}`);
    }
  }

  /**
   * Delete a stop by ID
   * @param {string} id - Stop ID
   * @returns {Promise<void>}
   */
  async remove(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        const error = new Error('Stop not found');
        error.status = 404;
        throw error;
      }

      await this.collection.doc(id).delete();
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in remove:', error);
      throw new Error(`Database error while deleting stop: ${error.message}`);
    }
  }
}

module.exports = {
  FirestoreStopRepository,
  stopRepository: new FirestoreStopRepository()
};

