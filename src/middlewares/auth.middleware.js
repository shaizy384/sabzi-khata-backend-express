import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.send(new ApiError(400, "Unauthorized Access"))
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) {
            return res.status(400).send(new ApiError(400, "Invalid Access Token"))
        }

        req.user = user
        next()
    } catch (error) {
        res.status(500).send(new ApiError(500, error.message || "Invalid Access Token"))
    }
})