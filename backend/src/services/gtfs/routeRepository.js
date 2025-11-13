/**
 * Route Repository
 *
 * Repository pattern for Route entity.
 * Maps GTFS Route models ↔ Firestore cleanly.
 */

const { db } = require('../../config/db');
const { Route } = require('../../models/gtfs');
const { FieldValue } = require('firebase-admin').firestore;

/**
 * FirestoreRouteRepository
 *
 * Firestore implementation for Route repository.
 */
class FirestoreRouteRepository {
  constructor() {
    this.collection = db.collection(Route.collection());
  }

  /**
   * Map Firestore document to Route domain model
   * @private
   */
  _mapToModel(doc) {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return new Route({
      id: doc.id,
      agencyId: data.agencyId,
      shortName: data.shortName,
      longName: data.longName,
      desc: data.desc,
      type: data.type,
      url: data.url,
      color: data.color,
      textColor: data.textColor,
      sortOrder: data.sortOrder,
      continuousPickup: data.continuousPickup,
      continuousDropOff: data.continuousDropOff,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  /**
   * Map Route domain model to Firestore document data
   * @private
   */
  _mapToDocument(route, isUpdate = false) {
    const data = {
      agencyId: route.agencyId,
      shortName: route.shortName,
      longName: route.longName,
      desc: route.desc,
      type: route.type,
      url: route.url,
      color: route.color,
      textColor: route.textColor,
      sortOrder: route.sortOrder,
      continuousPickup: route.continuousPickup,
      continuousDropOff: route.continuousDropOff,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      data.createdAt = FieldValue.serverTimestamp();
    }

    return data;
  }

  /**
   * Find a route by ID
   * @param {string} id - Route ID
   * @returns {Promise<Route|null>}
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in findById:', error);
      throw new Error(`Database error while finding route by ID: ${error.message}`);
    }
  }

  /**
   * Find routes by agency
   * @param {string} agencyId - Agency ID
   * @returns {Promise<Route[]>}
   */
  async findByAgency(agencyId) {
    try {
      const snapshot = await this.collection
        .where('agencyId', '==', agencyId)
        .get();

      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in findByAgency:', error);
      throw new Error(`Database error while finding routes by agency: ${error.message}`);
    }
  }

  /**
   * List routes with optional filters
   * @param {Object} options - Query options
   * @returns {Promise<Route[]>}
   */
  async list(options = {}) {
    try {
      let query = this.collection;

      if (options.type) {
        query = query.where('type', '==', options.type);
      }

      if (options.agencyId) {
        query = query.where('agencyId', '==', options.agencyId);
      }

      // Order by sortOrder if available
      if (options.orderBy === 'sortOrder') {
        query = query.orderBy('sortOrder', 'asc');
      }

      const limit = options.limit || 100;
      query = query.limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in list:', error);
      throw new Error(`Database error while listing routes: ${error.message}`);
    }
  }

  /**
   * Create a new route
   * @param {Route} route - Route domain model
   * @returns {Promise<Route>}
   */
  async create(route) {
    try {
      const docData = this._mapToDocument(route, false);
      const docRef = await this.collection.add(docData);
      const createdDoc = await docRef.get();
      return this._mapToModel(createdDoc);
    } catch (error) {
      console.error('Firestore error in create:', error);
      throw new Error(`Database error while creating route: ${error.message}`);
    }
  }

  /**
   * Update an existing route
   * @param {Route} route - Route domain model with ID
   * @returns {Promise<Route>}
   */
  async update(route) {
    try {
      if (!route.id) {
        throw new Error('Route ID is required for update');
      }

      const docRef = this.collection.doc(route.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        const error = new Error('Route not found');
        error.status = 404;
        throw error;
      }

      const updateData = this._mapToDocument(route, true);
      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in update:', error);
      throw new Error(`Database error while updating route: ${error.message}`);
    }
  }

  /**
   * Delete a route by ID
   * @param {string} id - Route ID
   * @returns {Promise<void>}
   */
  async remove(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        const error = new Error('Route not found');
        error.status = 404;
        throw error;
      }

      await this.collection.doc(id).delete();
    } catch (error) {
      if (error.status) throw error;
      console.error('Firestore error in remove:', error);
      throw new Error(`Database error while deleting route: ${error.message}`);
    }
  }
}

module.exports = {
  FirestoreRouteRepository,
  routeRepository: new FirestoreRouteRepository()
};

