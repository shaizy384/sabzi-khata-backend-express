import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addCustomer, addCustomerCash, addSale, getCustomer, getCustomerTransactionReport, getCustomers, updateCustomer, updateCustomerStatus } from "../controllers/customer.controller.js";
import { addCustomerTransaction, getCustomerTransactions } from "../controllers/customerTransactions.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/addCustomer").post(upload.single("profile_image"), addCustomer)
router.route("/updateCustomer").patch(upload.single("profile_image"), updateCustomer)
router.route("/getCustomers").get(getCustomers)
router.route("/getCustomer/:id").get(getCustomer)
router.route("/updateStatus/:id").get(updateCustomerStatus)

router.route("/addSale").post(addSale)
router.route("/addCash").post(addCustomerCash)
router.route("/getTransactionReport").get(getCustomerTransactionReport)

export default router