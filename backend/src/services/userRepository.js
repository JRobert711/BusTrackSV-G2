/**
 * User Repository
 *
 * Repository pattern for User entity.
 * Maps domain models ↔ Firestore cleanly.
 */

const { db } = require('../config/db');
const User = require('../models/User');
const { FieldValue } = require('firebase-admin').firestore;

/**
 * IUserRepository Interface
 *
 * Contract for User repository implementations.
 * All implementations must provide these methods.
 *
 * @interface IUserRepository
 */
class IUserRepository {
  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>} User instance or null if not found
   * @throws {Error} If database error occurs
   */
  async findByEmail(_email) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>} User instance or null if not found
   * @throws {Error} If database error occurs
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new user
   * @param {User} user - User domain model
   * @returns {Promise<User>} Created user with ID
   * @throws {Error} If database error occurs or email already exists
   */
  async create(_user) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing user
   * @param {User} user - User domain model
   * @returns {Promise<User>} Updated user
   * @throws {Error} If database error occurs or user not found
   */
  async update(_user) {
    throw new Error('Method not implemented');
  }
}

/**
 * FirestoreUserRepository
 *
 * Firestore implementation of IUserRepository.
 * Maps User domain models to/from Firestore documents.
 */
class FirestoreUserRepository extends IUserRepository {
  constructor() {
    super();
    this.collection = db.collection(User.collection());
  }

  /**
   * Map Firestore document to User domain model
   * @private
   * @param {FirebaseFirestore.DocumentSnapshot} doc - Firestore document
   * @returns {User|null} User instance or null if document doesn't exist
   */
  _mapToModel(doc) {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return new User({
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  }

  /**
   * Map User domain model to Firestore document data
   * @private
   * @param {User} user - User domain model
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Firestore document data
   */
  _mapToDocument(user, isUpdate = false) {
    const data = {
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash: user.passwordHash,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      data.createdAt = FieldValue.serverTimestamp();
    }

    return data;
  }

  /**
   * Find a user by email
   * @param {string} email - User email (case-insensitive)
   * @returns {Promise<User|null>} User instance or null if not found
   * @throws {Error} If database error occurs (500)
   */
  async findByEmail(email) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const snapshot = await this.collection
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return this._mapToModel(snapshot.docs[0]);
    } catch (error) {
      console.error('Firestore error in findByEmail:', error);
      throw new Error(`Database error while finding user by email: ${error.message}`);
    }
  }

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>} User instance or null if not found
   * @throws {Error} If database error occurs (500)
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return this._mapToModel(doc);
    } catch (error) {
      console.error('Firestore error in findById:', error);
      throw new Error(`Database error while finding user by ID: ${error.message}`);
    }
  }

  /**
   * Create a new user
   * @param {User} user - User domain model (without ID)
   * @returns {Promise<User>} Created user with generated ID
   * @throws {Error} If database error occurs or email already exists
   */
  async create(user) {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(user.email);
      if (existingUser) {
        const error = new Error('User with this email already exists');
        error.status = 409; // Conflict
        throw error;
      }

      // Create Firestore document
      const docData = this._mapToDocument(user, false);
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
      throw new Error(`Database error while creating user: ${error.message}`);
    }
  }

  /**
   * Update an existing user
   * @param {User} user - User domain model with ID
   * @returns {Promise<User>} Updated user
   * @throws {Error} If database error occurs or user not found
   */
  async update(user) {
    try {
      if (!user.id) {
        throw new Error('User ID is required for update');
      }

      const docRef = this.collection.doc(user.id);

      // Check if user exists
      const doc = await docRef.get();
      if (!doc.exists) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Update document
      const updateData = this._mapToDocument(user, true);
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
      throw new Error(`Database error while updating user: ${error.message}`);
    }
  }

  /**
   * Delete a user by ID
   * @param {string} id - User ID
   * @returns {Promise<void>}
   * @throws {Error} If database error occurs
   */
  async remove(id) {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      console.error('Firestore error in remove:', error);
      throw new Error(`Database error while deleting user: ${error.message}`);
    }
  }

  /**
   * List all users with optional filters
   * @param {Object} options - Query options
   * @param {string} [options.role] - Filter by role
   * @param {number} [options.limit=10] - Maximum number of results
   * @returns {Promise<User[]>} Array of users
   * @throws {Error} If database error occurs
   */
  async list(options = {}) {
    try {
      let query = this.collection;

      // Apply filters
      if (options.role) {
        query = query.where('role', '==', options.role);
      }

      // Apply limit
      const limit = options.limit || 10;
      query = query.limit(limit);

      // Execute query
      const snapshot = await query.get();

      // Map documents to models
      return snapshot.docs.map(doc => this._mapToModel(doc));
    } catch (error) {
      console.error('Firestore error in list:', error);
      throw new Error(`Database error while listing users: ${error.message}`);
    }
  }
}

// Export interface and implementation
module.exports = {
  IUserRepository,
  FirestoreUserRepository,
  // Export singleton instance for convenience
  userRepository: new FirestoreUserRepository()
};
