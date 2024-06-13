import mongoose, { Schema } from "mongoose";

const purchaseSchema = new Schema(
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
        supplier_id: {
            type: Schema.Types.ObjectId,
            ref: "Supplier",
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

export const Purchase = mongoose.model("Purchase", purchaseSchema)