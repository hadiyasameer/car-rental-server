import e from "express"
import { adminLogin, adminLogout } from "../controllers/adminControllers.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { getAllDealers } from "../controllers/dealerControllers.js";

const router = e.Router();

router.post("/login",adminLogin)
router.post("/logout", adminAuth, adminLogout);
router.get("/admin/dealers",getAllDealers)

export { router as adminRouter }