import mongoose, { Schema } from "mongoose";

const supplierSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        cnic: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
            index: true
        },
        profile_image: {
            type: String,
            required: true
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sub_admin_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        status: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
    },
    { timestamps: true }
)

export const Supplier = mongoose.model("Supplier", supplierSchema)