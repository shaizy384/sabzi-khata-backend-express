import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addSubadmin, deleteSubadmin, getSubadmins, updateSubadmin, updateSubadminPassword } from "../controllers/subadmin.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/addSubadmin").post(addSubadmin)
router.route("/getSubadmins").get(getSubadmins)
router.route("/updateSubadmin").patch(updateSubadmin)
router.route("/updateSubadminPassword").patch(updateSubadminPassword)
router.route("/deleteSubadmin/:id").delete(deleteSubadmin)

export default router