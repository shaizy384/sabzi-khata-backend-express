import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { login, register } from "../validations/user.validations.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating accessToken and refreshToken")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body

    const { error, value } = register.body.validate(req.body);

    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        return res.status(409).send(new ApiError(409, "This email already exists"))
    }

    const user = await User.create({
        ...req.body,
        isAdmin: true
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        return res.status(500).send(new ApiError(500, "Something went wrong while registering user"))
    }

    return res.json(new ApiResponse(200, createdUser, "User is registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const { error } = login.body.validate(req.body);

    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(404).send(new ApiError(404, "User not found"))
    }

    const isPasswordCorrect = user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        return res.status(401).send(new ApiError(401, "Invalid user credentials"))
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { loggedinUser, accessToken, refreshToken }, "User logged in successfully")
        )
})

const logout = async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: 1 }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
}

export { registerUser, loginUser, logout }