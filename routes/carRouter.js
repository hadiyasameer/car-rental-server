import e from "express"
import { createCar, deleteCar, listCars, updateCar, viewCar } from "../controllers/carControllers.js";
import { dealerAuth } from "../middlewares/dealerAuth.js";
import { upload } from "../middlewares/multer.js";

const router = e.Router();

router.post("/addcar", upload.single("image"), dealerAuth(), createCar)
router.get("/carlist", listCars)
router.put("/updatecar/:carId",upload.single("image"), dealerAuth(), updateCar)
router.get("/viewcar/:carId", dealerAuth(), viewCar);
router.delete("/deletecar/:carId", dealerAuth(), deleteCar)

export { router as carRouter }