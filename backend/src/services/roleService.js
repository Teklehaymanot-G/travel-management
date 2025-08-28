const prisma = require("../utils/prisma");

class RoleService {
  // Get role hierarchy level
  static getRoleLevel(role) {
    const roleHierarchy = {
      TRAVELER: 1,
      SUPERVISOR: 2,
      MANAGER: 3,
    };
    return roleHierarchy[role] || 0;
  }

  // Check if user can modify target user
  static canModifyUser(requesterRole, targetRole) {
    const requesterLevel = this.getRoleLevel(requesterRole);
    const targetLevel = this.getRoleLevel(targetRole);

    return requesterLevel > targetLevel;
  }

  // Validate role assignment
  static validateRoleAssignment(currentRole, newRole) {
    const currentLevel = this.getRoleLevel(currentRole);
    const newLevel = this.getRoleLevel(newRole);

    // Can't promote to higher or equal level
    if (newLevel >= currentLevel) {
      return false;
    }
    return true;
  }
}

module.exports = RoleService;
