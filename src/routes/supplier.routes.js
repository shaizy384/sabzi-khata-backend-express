import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addSupplier, getSuppliers, updateSupplier, updateSupplierStatus } from "../controllers/supplier.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/addSupplier").post(upload.single("profile_image"), addSupplier)
router.route("/updateSupplier").post(upload.single("profile_image"), updateSupplier)
router.route("/getSuppliers").get(getSuppliers)
router.route("/updateStatus/:id").get(updateSupplierStatus)

export default router