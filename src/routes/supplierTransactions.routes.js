import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware"
import { addCustomerTransaction, getCustomerTransactions } from "../controllers/customerTransactions.controller"


const router = Router()

router.use(verifyJwt)

router.route("/addCustomerTransaction").post(addCustomerTransaction)
router.route("/getCustomerTransactions").post(getCustomerTransactions)

export default router