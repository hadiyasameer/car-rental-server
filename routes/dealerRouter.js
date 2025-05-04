import e from "express"
import { dealerSignup, dealerLogin, dealerLogout, dealerProfile, checkDealer } from "../controllers/dealerControllers.js";
import { dealerAuth } from "../middlewares/dealerAuth.js";

const router = e.Router();

router.post("/signup", dealerSignup)
router.post("/login", dealerLogin)

router.get("/profile", dealerAuth(), dealerProfile);

router.get("/logout", dealerLogout);

router.get("/check-dealer", dealerAuth(), checkDealer);

export { router as dealerRouter }