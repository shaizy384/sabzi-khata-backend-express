import mongoose, { Schema } from "mongoose";

const supplierTransactionsSchema = new Schema(
    {
        amount_type: {
            type: String,
            required: true,
            enum: ["debit", "credit"]
        },
        amount_added: {
            type: Number,
            required: true
        },
        previous_amount: {
            type: Number,
            required: true
        },
        remaining_amount: {
            type: Number,
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

export const SupplierTransactions = mongoose.model("SupplierTransactions", supplierTransactionsSchema)