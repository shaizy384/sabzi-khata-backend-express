import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("publlic"))
app.use(cookieParser())

// import routes
import userRouter from "./routes/user.routes.js"
import subadminRouter from "./routes/subadmin.routes.js"
import customerRouter from "./routes/customer.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/subadmins", subadminRouter)
app.use("/api/v1/customers", customerRouter)

export { app }