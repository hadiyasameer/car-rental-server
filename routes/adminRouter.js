import e from "express"
import { adminLogin, adminLogout } from "../controllers/adminControllers.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = e.Router();

router.post("/login",adminLogin)
router.post("/logout", adminAuth, adminLogout);

export { router as adminRouter }