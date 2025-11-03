/**
 * Bus Repository
 *
 * Repository pattern for Bus entity.
 * Maps domain models ↔ Firestore cleanly with pagination support.
 */

const { db } = require('../config/db');
const Bus = require('../models/Bus');
const { FieldValue } = require('firebase-admin').firestore;

/**
 * IBusRepository Interface
 *
 * Contract for Bus repository implementations.
 * All implementations must provide these methods.
 *
 * @interface IBusRepository
 */
class IBusRepository {
  /**
   * List buses with pagination and filters
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.pageSize=10] - Items per page
   * @param {Object} [options.filters] - Filter criteria
   * @param {string} [options.filters.status] - Filter by status
   * @param {boolean} [options.filters.isFavorite] - Filter by favorite status
   * @param {string} [options.filters.route] - Filter by route
   * @returns {Promise<{buses: Bus[], total: number, page: number, pageSize: number, totalPages: number}>}
   * @throws {Error} If database error occurs
   */
  async list(_options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a bus by ID
   * @param {string} id - Bus ID
   * @returns {Promise<Bus|null>} Bus instance or null if not found
   * @throws {Error} If database error occurs
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a bus by license plate
   * @param {string} licensePlate - License plate
   * @returns {Promise<Bus|null>} Bus instance or null if not found
   * @throws {Error} If database error occurs
   */
  async findByLicensePlate(_licensePlate) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new bus
   * @param {Bus} bus - Bus domain model
   * @returns {Promise<Bus>} Created bus with ID
   * @throws {Error} If database error occurs
   */
  async create(_bus) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing bus
   * @param {Bus} bus - Bus domain model with ID
   * @returns {Promise<Bus>} Updated bus
   * @throws {Error} If database error occurs or bus not found
   */
  async update(_bus) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a bus by ID
   * @param {string} id - Bus ID
   * @returns {Promise<void>}
   * @throws {Error} If database error occurs
   */
  async remove(_id) {
    throw new Error('Method not implemented');
  }
}

/**
 * FirestoreBusRepository
 *
 * Firestore implementation of IBusRepository.
 * Maps Bus domain models to/from Firestore documents.
 */
class FirestoreBusRepository extends IBusRepository {
  constructor() {
    super();
    this.collection = db.collection(Bus.collection());
  }

  /**
   * Map Firestore document to Bus domain model
   * @private
   * @param {FirebaseFirestore.DocumentSnapshot} doc - Firestore document
   * @returns {Bus|null} Bus instance or null if document doesn't exist
   */
  _mapToModel(doc) {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    // Map position if it exists
    let position = null;
    if (data.position && typeof data.position === 'object') {
      position = {
        lat: data.position.lat,
        lng: data.position.lng
      };
    }

    return new Bus({
      id: doc.id,
      licensePlate: data.licensePlate,
      unitName: data.unitName,
      status: data.status,
      route: data.route || null,
      driver: data.driver || null,
      movingTime: data.movingTime || 0,
      parkedTime: data.parkedTime || 0,
      isFavorite: data.isFavorite || false,
      position: position
    });
  }

  /**
   * Map Bus domain model to Firestore document data
   * @private
   * @param {Bus} bus - Bus domain model
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Firestore document data
   */
  _mapToDocument(bus, isUpdate = false) {
    const data = {
      licensePlate: bus.licensePlate,
      unitName: bus.unitName,
      status: bus.status,
      route: bus.route,
      driver: bus.driver,
      movingTime: bus.movingTime,
      parkedTime: bus.parkedTime,
      isFavorite: bus.isFavorite,
      position: bus.position,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      data.createdAt = FieldValue.serverTimestamp();
    }

    return data;
  }

  /**
   * List buses with pagination and filters
   *
   * Currently uses simple offset-based pagination.
   *
   * TODO: Implement cursor-based pagination for better performance at scale:
   * - Use startAfter with last document from previous page
   * - Return cursor (last document ID) in response
   * - Accept cursor parameter to continue from last position
   * - Benefits: Constant time complexity, works with real-time updates
   *
   * Example cursor pagination:
   * ```javascript
   * let query = this.collection;
   * if (options.cursor) {
   *   const lastDoc = await this.collection.doc(options.cursor).get();
   *   query = query.startAfter(lastDoc);
   * }
   * query = query.limit(pageSize);
   * const snapshot = await query.get();
   * const cursor = snapshot.docs[snapshot.docs.length - 1]?.id;
   * return { buses, cursor, hasMore: snapshot.docs.length === pageSize };
   * ```
   *
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.pageSize=10] - Items per page
   * @param {Object} [options.filters] - Filter criteria
   * @param {string} [options.filters.status] - Filter by status
   * @param {boolean} [options.filters.isFavorite] - Filter by favorite status
   * @param {string} [options.filters.route] - Filter by route
   * @returns {Promise<{buses: Bus[], total: number, page: number, pageSize: number, totalPages: number}>}
   * @throws {Error} If database error occurs (500)
   */
  async list(options = {}) {
    try {
      const page = Math.max(1, options.page || 1);
      const pageSize = Math.min(100, Math.max(1, options.pageSize || 10));
      const filters = options.filters || {};

      let query = this.collection;

      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.isFavorite !== undefined) {
        query = query.where('isFavorite', '==', Boolean(filters.isFavorite));
      }

      if (filters.route) {
        query = query.where('route', '==', filters.route);
      }

      // Get total count for pagination metadata
      // Note: This is expensive at scale. For cursor pagination, return hasMore instead.
      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      // Apply pagination (simple offset-based)
      const offset = (page - 1) * pageSize;
      query = query.offset(offset).limit(pageSize);

      // Execute paginated query
      const snapshot = await query.get();

      // Map documents to models
      const buses = snapshot.docs.map(doc => this._mapToModel(doc));

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / pageSize);

      return {
        buses,
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages
      };
    } catch (error) {
      console.error('Firestore error in list:', error);
      throw new Error(`Database error while listing buses: ${error.message}`);
    }
  }

  /**
   * Find a bus by ID
   * @param {string} id - Bus ID
   * @returns {Promise<Bus|null>} Bus instance or null if not found
   * @throws {Error} If database error occurs (500)
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in findById:', error);
      throw new Error(`Database error while finding bus by ID: ${error.message}`);
    }
  }

  /**
   * Find a bus by license plate
   * @param {string} licensePlate - License plate (case-insensitive)
   * @returns {Promise<Bus|null>} Bus instance or null if not found
   * @throws {Error} If database error occurs (500)
   */
  async findByLicensePlate(licensePlate) {
    try {
      const normalizedPlate = licensePlate.toUpperCase().trim();
      const snapshot = await this.collection
        .where('licensePlate', '==', normalizedPlate)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return this._mapToModel(snapshot.docs[0]);
    } catch (error) {
      console.error('Firestore error in findByLicensePlate:', error);
      throw new Error(`Database error while finding bus by license plate: ${error.message}`);
    }
  }

  /**
   * Create a new bus
   * @param {Bus} bus - Bus domain model (without ID)
   * @returns {Promise<Bus>} Created bus with generated ID
   * @throws {Error} If database error occurs or license plate already exists
   */
  async create(bus) {
    try {
      // Check if license plate already exists
      const existingBus = await this.findByLicensePlate(bus.licensePlate);
      if (existingBus) {
        const error = new Error('Bus with this license plate already exists');
        error.status = 409; // Conflict
        throw error;
      }

      // Create Firestore document
      const docData = this._mapToDocument(bus, false);
      const docRef = await this.collection.add(docData);

      // Get the created document with server timestamps resolved
      const createdDoc = await docRef.get();

      return this._mapToModel(createdDoc);
    } catch (error) {
      // Re-throw known errors (like 409 Conflict)
      if (error.status) {
        throw error;
      }

      // Wrap Firestore errors as 500
      console.error('Firestore error in create:', error);
      throw new Error(`Database error while creating bus: ${error.message}`);
    }
  }

  /**
   * Update an existing bus
   * @param {Bus} bus - Bus domain model with ID
   * @returns {Promise<Bus>} Updated bus
   * @throws {Error} If database error occurs or bus not found
   */
  async update(bus) {
    try {
      if (!bus.id) {
        throw new Error('Bus ID is required for update');
      }

      const docRef = this.collection.doc(bus.id);

      // Check if bus exists
      const doc = await docRef.get();
      if (!doc.exists) {
        const error = new Error('Bus not found');
        error.status = 404;
        throw error;
      }

      // Update document
      const updateData = this._mapToDocument(bus, true);
      await docRef.update(updateData);

      // Get updated document
      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      // Re-throw known errors (like 404 Not Found)
      if (error.status) {
        throw error;
      }

      // Wrap Firestore errors as 500
      console.error('Firestore error in update:', error);
      throw new Error(`Database error while updating bus: ${error.message}`);
    }
  }

  /**
   * Delete a bus by ID
   * @param {string} id - Bus ID
   * @returns {Promise<void>}
   * @throws {Error} If database error occurs (500)
   */
  async remove(id) {
    try {
      // Check if bus exists before deleting
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        const error = new Error('Bus not found');
        error.status = 404;
        throw error;
      }

      await this.collection.doc(id).delete();
    } catch (error) {
      // Re-throw known errors (like 404 Not Found)
      if (error.status) {
        throw error;
      }

      // Wrap Firestore errors as 500
      console.error('Firestore error in remove:', error);
      throw new Error(`Database error while deleting bus: ${error.message}`);
    }
  }

  /**
   * Update bus position
   * @param {string} id - Bus ID
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Bus>} Updated bus
   * @throws {Error} If database error occurs or bus not found
   */
  async updatePosition(id, lat, lng) {
    try {
      const docRef = this.collection.doc(id);

      // Check if bus exists
      const doc = await docRef.get();
      if (!doc.exists) {
        const error = new Error('Bus not found');
        error.status = 404;
        throw error;
      }

      // Update position
      await docRef.update({
        position: { lat, lng },
        updatedAt: FieldValue.serverTimestamp()
      });

      // Get updated document
      const updatedDoc = await docRef.get();
      return this._mapToModel(updatedDoc);
    } catch (error) {
      // Re-throw known errors
      if (error.status) {
        throw error;
      }

      // Wrap Firestore errors as 500
      console.error('Firestore error in updatePosition:', error);
      throw new Error(`Database error while updating bus position: ${error.message}`);
    }
  }
}

// Export interface and implementation
module.exports = {
  IBusRepository,
  FirestoreBusRepository,
  // Export singleton instance for convenience
  busRepository: new FirestoreBusRepository()
};
