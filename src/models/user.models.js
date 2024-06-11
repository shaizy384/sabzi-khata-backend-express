import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        isAdmin: {
            type: Boolean,
            // default: false
        },
        dashboard: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        product: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        supplier: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        customer: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        admin_roles: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        customer_report: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        supplier_report: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        refreshToken: {
            type: String,
        }
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            isAdmin: this.isAdmin,
            user_id: this.user_id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)