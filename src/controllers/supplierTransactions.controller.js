import { Supplier } from "../models/supplier.models.js";
import { SupplierTransactions } from "../models/supplierTransactions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addSupTransactionValidation } from "../validations/addTransaction.validations.js";

const addSupplierTransaction = asyncHandler(async (req, res) => {

    const { error } = addSupTransactionValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const supplier = await Supplier.findById(req.body.supplier_id)
    if (!supplier) {
        return res.status(404).send(new ApiError(404, "Supplier not found"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    supplier = await Supplier.findByIdAndUpdate(
        req.body.supplier_id,
        {
            amount: req.body.remaining_amount
        },
        { new: true }
    )

    const transaction = await SupplierTransactions.create({
        ...req.body,
        user_id,
        sub_admin_id
    })

    const createdTransaction = await SupplierTransactions.findById(transaction._id)

    if (!createdTransaction) {
        return res.status(500).send(new ApiError(500, "Something went wrong will creating transaction"))
    }

    return res.json(new ApiResponse(200, createdTransaction, "Transaction added successfully"))
})

const getSupplierTransactions = asyncHandler(async (req, res) => {

    const customer_id = req.params.id
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const transactions = await SupplierTransactions.find({ $and: [{ user_id }, { customer_id }] })

    return res.json(new ApiResponse(200, transactions, "Transactions fetched successfully"))
})

export { addSupplierTransaction, getSupplierTransactions }