import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addCustomer, getCustomers, updateCustomer, updateCustomerStatus } from "../controllers/customer.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/addCustomer").post(upload.single("profile_image"), addCustomer)
router.route("/updateCustomer").post(upload.single("profile_image"), updateCustomer)
router.route("/getCustomers").get(getCustomers)
router.route("/updateStatus/:id").get(updateCustomerStatus)

export default router