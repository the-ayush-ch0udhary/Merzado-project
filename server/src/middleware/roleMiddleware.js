/**
 * Role-Based Access Control (RBAC) middleware
 */

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in first.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(
          ', '
        )}]. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
};

const requireBuyer = requireRole('BUYER');
const requireSupplier = requireRole('SUPPLIER');

module.exports = {
  requireRole,
  requireBuyer,
  requireSupplier,
};
