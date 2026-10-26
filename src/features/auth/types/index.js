/**
 * @typedef {Object} UserRole
 * @property {string} _id
 * @property {string} name
 * @property {Array<Record<string, Record<string, boolean>>>} [permissions]
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} email
 * @property {string} name
 * @property {string} [type]
 * @property {string|null} [tenantId]
 * @property {string} [companyName]
 * @property {string} [phone]
 * @property {UserRole|string} [role]
 * @property {boolean} [isActive]
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 * @property {boolean} loading
 * @property {string|null} error
 * @property {boolean} otpRequired
 * @property {string|null} pendingEmail
 * @property {string|null} successMessage
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 * @property {boolean} [remember]
 */

export {};
