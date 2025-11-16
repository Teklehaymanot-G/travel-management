const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// List banks (optionally filter status)
async function listBanks(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== "all") where.status = status;
    const banks = await prisma.bank.findMany({
      orderBy: { createdAt: "desc" },
      where,
    });
    res.json({ success: true, data: banks });
  } catch (e) {
    next(e);
  }
}

// Create bank
async function createBank(req, res, next) {
  try {
    const { name, accountName, accountNumber, status } = req.body;
    if (!name || !accountName || !accountNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const logoUrl = req.file
      ? `/uploads/banks/${req.file.filename}`
      : req.body.logoUrl || null;
    const bank = await prisma.bank.create({
      data: {
        name,
        logoUrl,
        accountName,
        accountNumber,
        status: status || "ACTIVE",
      },
    });
    res.status(201).json({ success: true, data: bank });
  } catch (e) {
    next(e);
  }
}

// Update bank
async function updateBank(req, res, next) {
  try {
    const { id } = req.params;
    const { name, accountName, accountNumber, status } = req.body;
    const data = { name, accountName, accountNumber, status };
    if (req.file) {
      data.logoUrl = `/uploads/banks/${req.file.filename}`;
    } else if (req.body.logoUrl !== undefined) {
      data.logoUrl = req.body.logoUrl || null;
    }
    const bank = await prisma.bank.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json({ success: true, data: bank });
  } catch (e) {
    next(e);
  }
}

// Toggle status
async function toggleBankStatus(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.bank.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) return res.status(404).json({ message: "Bank not found" });
    const bank = await prisma.bank.update({
      where: { id: existing.id },
      data: { status: existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    });
    res.json({ success: true, data: bank });
  } catch (e) {
    next(e);
  }
}

// Delete bank
async function deleteBank(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.bank.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listBanks,
  createBank,
  updateBank,
  toggleBankStatus,
  deleteBank,
};
