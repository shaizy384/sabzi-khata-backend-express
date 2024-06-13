import { Customer } from "../models/customer.models.js";
import { CustomerTransactions } from "../models/customerTransactions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addCustTransactionValidation } from "../validations/addTransaction.validations.js";

const addCustomerTransaction = asyncHandler(async (req, res) => {

    const { error } = addCustTransactionValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const customer = await Customer.findById(req.body.customer_id)
    if (!customer) {
        return res.status(404).send(new ApiError(404, "Customer not found"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    customer = await Customer.findByIdAndUpdate(
        req.body.customer_id,
        {
            amount: req.body.remaining_amount
        },
        { new: true }
    )

    const transaction = await CustomerTransactions.create({
        ...req.body,
        user_id,
        sub_admin_id
    })

    const createdTransaction = await CustomerTransactions.findById(transaction._id)

    if (!createdTransaction) {
        return res.status(500).send(new ApiError(500, "Something went wrong will creating transaction"))
    }

    return res.json(new ApiResponse(200, createdTransaction, "Transaction added successfully"))
})

const getCustomerTransactions = asyncHandler(async (req, res) => {

    const customer_id = req.params.id
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const transactions = await CustomerTransactions.find({ $and: [{ user_id }, { customer_id }] })

    return res.json(new ApiResponse(200, transactions, "Transactions fetched successfully"))
})

export { addCustomerTransaction, getCustomerTransactions }