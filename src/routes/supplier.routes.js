import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addPurchase, addSupplier, getSupplier, getSuppliers, updateSupplier, updateSupplierStatus } from "../controllers/supplier.controller.js";
import { addSupplierTransaction, getSupplierTransactions } from "../controllers/supplierTransactions.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/addSupplier").post(upload.single("profile_image"), addSupplier)
router.route("/updateSupplier").post(upload.single("profile_image"), updateSupplier)
router.route("/getSuppliers").get(getSuppliers)
router.route("/getSupplier/:id").get(getSupplier)
router.route("/updateStatus/:id").get(updateSupplierStatus)

router.route("/addSupplierTransaction").post(addSupplierTransaction)
router.route("/getSupplierTransactions/:id").get(getSupplierTransactions)
router.route("/addPurchase").post(addPurchase)


export default router