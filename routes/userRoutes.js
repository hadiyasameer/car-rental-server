import e from "express"
import { userSignup, userLogin, userLogout, userProfile, checkUser } from "../controllers/userControllers.js";
import { userAuth } from "../middlewares/userAuth.js";

const router = e.Router();

router.post("/signup", userSignup)
router.put("/login", userLogin)

router.get("/profile", userAuth, userProfile);

router.get("/logout", userAuth, userLogout);

router.get("/check-user", userAuth, checkUser);

export { router as userRouter }