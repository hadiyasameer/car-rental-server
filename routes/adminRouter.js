import e from "express"
import { adminLogin, adminLogout, deleteDealer, deleteUser, getAllDealers, getAllUsers } from "../controllers/adminControllers.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = e.Router();

router.post("/login", adminLogin)
router.post("/logout", adminAuth, adminLogout);
router.get("/dealers", adminAuth, getAllDealers)
router.get("/users", adminAuth, getAllUsers)
router.delete('/dealers/:id', deleteDealer);
router.delete('/users/:id',deleteUser)

export { router as adminRouter }