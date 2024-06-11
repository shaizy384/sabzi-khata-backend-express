import { Router } from "express"
import { getUser, loginUser, logout, registerUser } from "../controllers/user.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt, logout)
router.route("/getUser").get(verifyJwt, getUser)

export default router