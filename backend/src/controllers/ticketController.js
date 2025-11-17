const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Pattern: BOOKING:<bookingId>-IDX:<index>-NAME:<name>
const QR_PATTERN = /^BOOKING:(\d+)-IDX:(\d+)-NAME:(.+)$/;

function tryDecodeBase64(input) {
  try {
    // Fast check: base64 charset and padding, but still guard with try/catch
    const decoded = Buffer.from(input, "base64").toString("utf8");
    // If decoding results in many non-printable chars, consider it invalid
    if (!decoded || /[\x00-\x08\x0E-\x1F]/.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

async function scanTicket(req, res, next) {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Missing QR code data" });
    }

    // Support both encoded (base64) and legacy plain-text payloads
    const trimmed = code.trim();
    const maybeDecoded = tryDecodeBase64(trimmed);
    const plain = maybeDecoded || trimmed;

    const match = plain.match(QR_PATTERN);
    if (!match) {
      return res.status(400).json({ message: "Invalid QR code format" });
    }

    const bookingId = parseInt(match[1]);
    const idx = parseInt(match[2]); // 1-based index
    const nameRaw = match[3].trim();

    // Load booking with tickets
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tickets: true, travel: true },
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!Array.isArray(booking.tickets) || booking.tickets.length === 0) {
      return res.status(404).json({ message: "No tickets for booking" });
    }

    // Determine ticket by index ordering by id asc
    const ordered = [...booking.tickets].sort((a, b) => a.id - b.id);
    if (idx < 1 || idx > ordered.length) {
      return res.status(400).json({ message: "Ticket index out of range" });
    }
    const ticket = ordered[idx - 1];

    // Basic name match (case-insensitive, trim)
    const ticketName = (ticket.name || "").trim();
    if (ticketName.toLowerCase() !== nameRaw.toLowerCase()) {
      return res.status(400).json({ message: "Name mismatch" });
    }

    // Already scanned?
    if (ticket.checkedIn) {
      return res.status(200).json({
        success: true,
        alreadyScanned: true,
        checkedInAt: ticket.checkedInAt,
        ticket: {
          id: ticket.id,
          name: ticket.name,
          badgeNumber: ticket.badgeNumber,
          bookingId: ticket.bookingId,
        },
      });
    }

    // Update ticket
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        checkedIn: true,
        checkedInById: req.user.id,
        checkedInAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      alreadyScanned: false,
      ticket: {
        id: updated.id,
        name: updated.name,
        badgeNumber: updated.badgeNumber,
        bookingId: updated.bookingId,
        checkedInAt: updated.checkedInAt,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { scanTicket };
