import mongoose, { Schema } from "mongoose";

const saleSchema = new Schema(
    {
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        customer_id: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
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
        }
    },
    { timestamps: true }
)

export const Sale = mongoose.model("Sale", saleSchema)