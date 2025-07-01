import e from "express"
import { dealerSignup, dealerLogin, dealerLogout, dealerProfile, checkDealer, notificationList, getUnreadNotificationCount, markNotificationAsRead } from "../controllers/dealerControllers.js";
import { dealerAuth } from "../middlewares/dealerAuth.js";

const router = e.Router();

router.post("/signup", dealerSignup)
router.post("/login", dealerLogin)

router.get("/profile", dealerAuth(), dealerProfile);

router.get("/logout", dealerLogout);

router.get("/check-dealer", dealerAuth(), checkDealer);

router.get("/notifications",dealerAuth(),notificationList);
router.get("/notifications/unread-count",dealerAuth(),getUnreadNotificationCount);
router.patch("/notifications/:id/mark-read",dealerAuth(),markNotificationAsRead)

export { router as dealerRouter }