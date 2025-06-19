import express from "express"
import { subscribeUser } from "../controllers/subscriptionController.js";

const router = express.Router();

router.post('/dosubscribe', subscribeUser);

export { router as subscriptionRouter }