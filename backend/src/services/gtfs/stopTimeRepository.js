/**
 * StopTime Repository
 *
 * Repository pattern for StopTime entity.
 * Maps GTFS StopTime models ↔ Firestore cleanly.
 */

const { db } = require('../../config/db');
const { StopTime } = require('../../models/gtfs');
const { FieldValue } = require('firebase-admin').firestore;

/**
 * FirestoreStopTimeRepository
 *
 * Firestore implementation for StopTime repository.
 */
class FirestoreStopTimeRepository {
  constructor() {
    this.collection = db.collection(StopTime.collection());
  }

  /**
   * Map Firestore document to StopTime domain model
   * @private
   */
  _mapToModel(doc) {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return new StopTime({
      id: doc.id,
      tripId: data.tripId,
      arrivalTime: data.arrivalTime,
      departureTime: data.departureTime,
      stopId: data.stopId,
      stopSequence: data.stopSequence,
      stopHeadsign: data.stopHeadsign,
      pickupType: data.pickupType,
      dropOffType: data.dropOffType,
      shapeDistTraveled: data.shapeDistTraveled,
      timepoint: data.timepoint,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  /**
   * Map StopTime domain model to Firestore document data
   * @private
   */
  _mapToDocument(stopTime, isUpdate = false) {
    const data = {
      tripId: stopTime.tripId,
      arrivalTime: stopTime.arrivalTime,
      departureTime: stopTime.departureTime,
      stopId: stopTime.stopId,
      stopSequence: stopTime.stopSequence,
      stopHeadsign: stopTime.stopHeadsign,
      pickupType: stopTime.pickupType,
      dropOffType: stopTime.dropOffType,
      shapeDistTraveled: stopTime.shapeDistTraveled,
      timepoint: stopTime.timepoint,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      data.createdAt = FieldValue.serverTimestamp();
    }

    return data;
  }

  /**
   * Find a stop time by ID
   * @param {string} id - StopTime ID
   * @returns {Promise<StopTime|null>}
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in findById:', error);
      throw new Error(`Database error while finding stop time by ID: ${error.message}`);
    }
  }

  /**
   * Find stop times by trip (ordered by sequence)
   * @param {string} tripId - Trip ID
   * @returns {Promise<StopTime[]>}
   */
  async findByTrip(tripId) {
    try {
      const snapshot = await this.collection
        .where('tripId', '==', tripId)
        .orderBy('stopSequence', 'asc')
        .get();

      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in findByTrip:', error);
      throw new Error(`Database error while finding stop times by trip: ${error.message}`);
    }
  }

  /**
   * Find stop times by stop
   * @param {string} stopId - Stop ID
   * @returns {Promise<StopTime[]>}
   */
  async findByStop(stopId) {
    try {
      const snapshot = await this.collection
        .where('stopId', '==', stopId)
        .get();

      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in findByStop:', error);
      throw new Error(`Database error while finding stop times by stop: ${error.message}`);
    }
  }

  /**
   * List stop times with optional filters
   * @param {Object} options - Query options
   * @returns {Promise<StopTime[]>}
   */
  async list(options = {}) {
    try {
      let query = this.collection;

      if (options.tripId) {
        query = query.where('tripId', '==', options.tripId);
      }

      if (options.stopId) {
        query = query.where('stopId', '==', options.stopId);
      }

      // Order by stop sequence if filtering by trip
      if (options.tripId) {
        query = query.orderBy('stopSequence', 'asc');
      }

      const limit = options.limit || 100;
      query = query.limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in list:', error);
      throw new Error(`Database error while listing stop times: ${error.message}`);
    }
  }

  /**
   * Create a new stop time
   * @param {StopTime} stopTime - StopTime domain model
   * @returns {Promise<StopTime>}
   */
  async create(stopTime) {
    try {
      const docData = this._mapToDocument(stopTime, false);
      const docRef = await this.collection.add(docData);
      const createdDoc = await docRef.get();
      return this._mapToModel(createdDoc);
    } catch (error) {
      console.error('Firestore error in create:', error);
      throw new Error(`Database error while creating stop time: ${error.message}`);
    }
  }

  /**
   * Bulk create stop times (more efficient for full trip schedules)
   * @param {StopTime[]} stopTimes - Array of StopTime domain models
   * @returns {Promise<StopTime[]>}
   */
  async bulkCreate(stopTimes) {
    try {
      const batch = db.batch();
      const refs = [];

      stopTimes.forEach(stopTime => {
        const docRef = this.collection.doc();
        const docData = this._mapToDocument(stopTime, false);
        batch.set(docRef, docData);
        refs.push(docRef);
      });

      await batch.commit();

      // Fetch created documents
      const createdDocs = await Promise.all(
        refs.map(ref => ref.get())
      );

      return createdDocs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in bulkCreate:', error);
      throw new Error(`Database error while bulk creating stop times: ${error.message}`);
    }
  }

  /**
   * Update an existing stop time
   * @param {StopTime} stopTime - StopTime domain model with ID
   * @returns {Promise<StopTime>}
   */
  async update(stopTime) {
    try {
      if (!stopTime.id) {
        throw new Error('StopTime ID is required for update');
      }

      const docRef = this.collection.doc(stopTime.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const error = new Error('StopTime not found');
        error.status = 404;
        throw error;
      }

      const updateData = this._mapToDocument(stopTime, true);
      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in update:', error);
      throw new Error(`Database error while updating stop time: ${error.message}`);
    }
  }

  /**
   * Delete a stop time by ID
   * @param {string} id - StopTime ID
   * @returns {Promise<void>}
   */
  async remove(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        const error = new Error('StopTime not found');
        error.status = 404;
        throw error;
      }

      await this.collection.doc(id).delete();
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in remove:', error);
      throw new Error(`Database error while deleting stop time: ${error.message}`);
    }
  }

  /**
   * Delete all stop times for a trip
   * @param {string} tripId - Trip ID
   * @returns {Promise<number>} Number of deleted documents
   */
  async removeByTrip(tripId) {
    try {
      const snapshot = await this.collection
        .where('tripId', '==', tripId)
        .get();

      if (snapshot.empty) {
        return 0;
      }

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Firestore error in removeByTrip:', error);
      throw new Error(`Database error while deleting stop times by trip: ${error.message}`);
    }
  }
}

module.exports = {
  FirestoreStopTimeRepository,
  stopTimeRepository: new FirestoreStopTimeRepository()
};

