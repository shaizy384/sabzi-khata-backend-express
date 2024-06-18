import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addCustomer, addCustomerCash, addSale, getCustomer, getCustomers, updateCustomer, updateCustomerStatus } from "../controllers/customer.controller.js";
import { addCustomerTransaction, getCustomerTransactions } from "../controllers/customerTransactions.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/addCustomer").post(upload.single("profile_image"), addCustomer)
router.route("/updateCustomer").patch(upload.single("profile_image"), updateCustomer)
router.route("/getCustomers").get(getCustomers)
router.route("/getCustomer/:id").get(getCustomer)
router.route("/updateStatus/:id").get(updateCustomerStatus)

// router.route("/addCustomerTransaction").post(addCustomerTransaction)
// router.route("/getCustomerTransactions/:id").get(getCustomerTransactions)
router.route("/addSale").post(addSale)
router.route("/addCash").post(addCustomerCash)

export default router