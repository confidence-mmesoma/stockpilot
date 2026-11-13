import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Notifications are for admins only
router.use(requireAuth, requireRole("ADMIN"));

// GET /api/notifications (add ?unread=true to see only unread ones)
router.get("/", async (req, res) => {
  const unreadOnly = req.query.unread === "true";

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: unreadOnly ? { isRead: false } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  res.status(200).json({ unreadCount, notifications });
});

// POST /api/notifications/read-all
router.post("/read-all", async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  res.status(200).json({ updated: result.count });
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: "Invalid notification id" });
    return;
  }

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: "Notification not found" });
    return;
  }

  const notification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  res.status(200).json(notification);
});

export default router;
