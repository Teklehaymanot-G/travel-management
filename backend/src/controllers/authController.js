const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");
const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register user
// STEP 1: Request OTP for registration
const {
  normalizeEthiopianPhone,
  isValidEthiopianMobile,
} = require("../utils/phone");

const requestRegisterOtp = async (req, res, next) => {
  try {
    let { phone } = req.body;

    phone = normalizeEthiopianPhone(phone);
    if (!isValidEthiopianMobile(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid Ethiopian phone format" });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    // If user already exists we still issue an OTP (treat as login OTP) instead of erroring.
    // We'll reuse the same "register" purpose to keep client unchanged, but skip creation on verify.

    // Rate limit: allow one OTP per 60 seconds per phone
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recent = await prisma.otp.findFirst({
      where: { phone, purpose: "register", createdAt: { gt: oneMinuteAgo } },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      return res
        .status(429)
        .json({ message: "Please wait before requesting another OTP" });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await prisma.otp.create({
      data: { phone, codeHash, purpose: "register", expiresAt },
    });

    // TODO: Integrate SMS provider (e.g. Ethio Telecom / Twilio). For now we return code for dev.
    res.json({
      success: true,
      message: existingUser ? "OTP sent (existing user)" : "OTP sent",
      devCode: code,
      existing: Boolean(existingUser),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// STEP 2: Verify OTP and create account
const verifyRegisterOtp = async (req, res, next) => {
  try {
    let { phone, code, name, password, role = "TRAVELER" } = req.body;
    phone = normalizeEthiopianPhone(phone);
    if (!isValidEthiopianMobile(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid Ethiopian phone format" });
    }
    if (!phone || !code) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        purpose: "register",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }
    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ message: "Too many attempts" });
    }
    const match = await bcrypt.compare(code, otpRecord.codeHash);
    if (!match) {
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ message: "Invalid OTP" });
    }
    // Mark OTP used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    // If user already exists, treat this as login and return token (no new user creation)
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (existingUser) {
      const token = generateToken(existingUser.id);
      return res.status(200).json({
        success: true,
        token,
        user: existingUser,
        existing: true,
      });
    }

    // Otherwise create new user as before
    const salt = await bcrypt.genSalt(10);
    const rawPassword =
      password || Math.random().toString(36).slice(-8) + "A1!";
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    const newUser = await prisma.user.create({
      data: { phone, password: hashedPassword, name, role },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    const token = generateToken(newUser.id);
    res
      .status(201)
      .json({ success: true, token, user: newUser, existing: false });
  } catch (error) {
    next(error);
  }
};

// Register with PIN/password (no SMS)
const registerWithPassword = async (req, res, next) => {
  try {
    let { phone, name, password, role = "TRAVELER" } = req.body || {};
    phone = normalizeEthiopianPhone(phone);
    if (!isValidEthiopianMobile(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid Ethiopian phone format" });
    }
    if (!name || !password) {
      return res.status(400).json({ message: "Name and PIN are required" });
    }
    // basic PIN policy: 4-6 digits allowed (or longer password >= 6 chars)
    const isAllDigits = /^\d{4,6}$/.test(password);
    const isPasswordLike = typeof password === "string" && password.length >= 6;
    if (!isAllDigits && !isPasswordLike) {
      return res
        .status(400)
        .json({ message: "PIN must be 4-6 digits or password >= 6 chars" });
    }

    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: { phone, name, role, password: hashedPassword },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    const token = generateToken(newUser.id);
    res.status(201).json({ success: true, token, user: newUser });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    console.log(req.body);
    let { phone, password } = req.body;
    phone = normalizeEthiopianPhone(phone);
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        password: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(
      password || "",
      user.password || ""
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phone: true,
        name: true,
        profileImageUrl: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update current user (name, password, profile image)
const updateMe = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword, profileImageUrl } =
      req.body || {};

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const data = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();

    if (
      newPassword &&
      typeof newPassword === "string" &&
      newPassword.length >= 6
    ) {
      if (currentPassword && user.password) {
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok)
          return res
            .status(400)
            .json({ message: "Current password incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(newPassword, salt);
    }

    // Handle profile image: prefer uploaded file, fallback to provided URL/base64
    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/uploads/profiles/${
        req.file.filename
      }`;
      data.profileImageUrl = url;
    } else if (profileImageUrl) {
      // Accept data URI or http(s) URL directly
      data.profileImageUrl = profileImageUrl;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        phone: true,
        name: true,
        profileImageUrl: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestRegisterOtp,
  verifyRegisterOtp,
  registerWithPassword,
  login,
  getMe,
  updateMe,
};
