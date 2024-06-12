import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addProduct, getProducts, updateProduct, updateProductStatus } from "../controllers/product.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/addProduct").post(addProduct)
router.route("/updateProduct").patch(updateProduct)
router.route("/getProducts").get(getProducts)
router.route("/updateStatus").get(updateProductStatus)

export default router