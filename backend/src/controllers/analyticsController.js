const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/analytics/popular-destinations?limit=5
// Aggregates bookings count and approved revenue per travel.
// Returns array: [{ destination, bookings, revenue, travelId }]
const getPopularDestinations = async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit || "5");

		// Fetch travels with bookings + payment data
		const travels = await prisma.travel.findMany({
			include: {
				bookings: {
					include: {
						payment: true,
					},
				},
			},
		});

		const aggregated = travels.map((t) => {
			const bookingsCount = t.bookings.length;
			const revenue = t.bookings.reduce((sum, b) => {
				if (b.payment && b.payment.status === "APPROVED" && b.payment.finalAmount) {
					return sum + b.payment.finalAmount;
				}
				return sum;
			}, 0);
			return {
				destination: t.title,
				bookings: bookingsCount,
				revenue,
				travelId: t.id,
			};
		});

		aggregated.sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue);

		res.json({ success: true, data: aggregated.slice(0, limit) });
	} catch (error) {
		next(error);
	}
};

module.exports = { getPopularDestinations };
