import e from "express"
import { userRouter } from "./userRoutes.js";
import { dealerRouter } from "./dealerRouter.js";
import {adminRouter} from "./adminRouter.js"

const router = e.Router();

router.use("/user", userRouter)
router.use("/dealer", dealerRouter)
router.use("/admin", adminRouter)


export { router as apiRouter }