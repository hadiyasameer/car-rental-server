export const getDealerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ dealerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};
