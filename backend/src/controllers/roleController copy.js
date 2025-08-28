const prisma = require("../utils/prisma");
const { ForbiddenError } = require("../utils/errors");

class RoleController {
  // Get current user role
  static async getMyRole(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true },
      });

      if (!user) throw new Error("User not found");

      res.json({ role: user.role });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update user role (MANAGER only)
  static async updateUserRole(req, res) {
    try {
      // Authorization check
      if (req.user.role !== "MANAGER") {
        throw new ForbiddenError("Only managers can update roles");
      }

      const { userId } = req.params;
      const { newRole } = req.body;

      if (!["TRAVELER", "SUPERVISOR", "MANAGER"].includes(newRole)) {
        throw new Error("Invalid role specified");
      }

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { role: newRole },
        select: { id: true, phone: true, role: true },
      });

      res.json(updatedUser);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // List users by role (MANAGER only)
  static async listUsersByRole(req, res) {
    try {
      if (req.user.role !== "MANAGER") {
        throw new ForbiddenError("Only managers can view users");
      }

      const { role } = req.query;
      const validRoles = ["TRAVELER", "SUPERVISOR", "MANAGER"];

      if (role && !validRoles.includes(role)) {
        throw new Error("Invalid role filter");
      }

      const users = await prisma.user.findMany({
        where: role ? { role } : {},
        select: {
          id: true,
          phone: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.json(users);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
}

module.exports = RoleController;
