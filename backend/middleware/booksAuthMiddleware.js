// Role-based access control middleware for Books Services

const rolePermissions = {
  admin: {
    invoices: ['create', 'read', 'update', 'delete'],
    transactions: ['create', 'read', 'update', 'delete'],
    payments: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    vendors: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    users: ['create', 'read', 'update', 'delete'],
    config: ['create', 'read', 'update', 'delete']
  },
  accountant: {
    invoices: ['create', 'read', 'update'],
    transactions: ['create', 'read', 'update'],
    payments: ['create', 'read', 'update'],
    customers: ['create', 'read', 'update'],
    vendors: ['create', 'read', 'update'],
    reports: ['read'],
    users: ['read'],
    config: ['read']
  },
  viewer: {
    invoices: ['read'],
    transactions: ['read'],
    payments: ['read'],
    customers: ['read'],
    vendors: ['read'],
    reports: ['read'],
    users: [],
    config: []
  }
};

// Mock user from request (in real app, this would come from JWT token)
const attachUser = (req, res, next) => {
  // For now, we'll add a default user. In production, extract from JWT
  req.user = req.user || {
    id: 1,
    name: 'Default User',
    role: req.headers['x-user-role'] || 'accountant'
  };
  next();
};

// Check if user has permission for the action
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'viewer';
    const permissions = rolePermissions[userRole] || rolePermissions.viewer;

    if (!permissions[resource] || !permissions[resource].includes(action)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `${userRole} role cannot ${action} ${resource}`
      });
    }

    next();
  };
};

// Specific permission checkers
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireAdminOrAccountant = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Admin or Accountant access required' });
  }
  next();
};

const requireCanRead = (resource) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'viewer';
    const permissions = rolePermissions[userRole] || rolePermissions.viewer;

    if (!permissions[resource] || !permissions[resource].includes('read')) {
      return res.status(403).json({ error: `Cannot read ${resource}` });
    }
    next();
  };
};

const requireCanCreate = (resource) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'viewer';
    const permissions = rolePermissions[userRole] || rolePermissions.viewer;

    if (!permissions[resource] || !permissions[resource].includes('create')) {
      return res.status(403).json({ error: `Cannot create ${resource}` });
    }
    next();
  };
};

const requireCanUpdate = (resource) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'viewer';
    const permissions = rolePermissions[userRole] || rolePermissions.viewer;

    if (!permissions[resource] || !permissions[resource].includes('update')) {
      return res.status(403).json({ error: `Cannot update ${resource}` });
    }
    next();
  };
};

const requireCanDelete = (resource) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'viewer';
    const permissions = rolePermissions[userRole] || rolePermissions.viewer;

    if (!permissions[resource] || !permissions[resource].includes('delete')) {
      return res.status(403).json({ error: `Cannot delete ${resource}` });
    }
    next();
  };
};

module.exports = {
  rolePermissions,
  attachUser,
  checkPermission,
  requireAdmin,
  requireAdminOrAccountant,
  requireCanRead,
  requireCanCreate,
  requireCanUpdate,
  requireCanDelete
};
