import express from 'express'
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from 'cookie-parser'

dotenv.config({
    path: '.env'
})

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
import userRouter from "./routes/user.routes.js"
import dashboardRouter from "./routes/dasboard.routes.js"
import subadminRouter from "./routes/subadmin.routes.js"
import customerRouter from "./routes/customer.routes.js"
import supplierRouter from "./routes/supplier.routes.js"
import productRouter from "./routes/product.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/subadmins", subadminRouter)
app.use("/api/v1/customers", customerRouter)
app.use("/api/v1/suppliers", supplierRouter)
app.use("/api/v1/products", productRouter)

export { app }