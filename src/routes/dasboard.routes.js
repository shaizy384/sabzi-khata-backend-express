import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJwt)

router.route("/getDashboardData").get(getDashboardStats)

export default router