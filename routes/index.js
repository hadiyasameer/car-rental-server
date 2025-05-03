import e from "express"
import { userRouter } from "./userRoutes.js";
import { dealerRouter } from "./dealerRouter.js";
import {adminRouter} from "./adminRouter.js"
import { carRouter } from "./carRouter.js";
import { bookingRouter } from "./bookingRouter.js";
import { paymentRouter } from "./paymentRoutes.js";

const router = e.Router();

router.use("/user", userRouter)
router.use("/dealer", dealerRouter)
router.use("/admin", adminRouter)
router.use("/car", carRouter)
router.use("/booking",bookingRouter)
router.use("/payment",paymentRouter)


export { router as apiRouter }