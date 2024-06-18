import mongoose from "mongoose";
import { Customer } from "../models/customer.models.js";
import { Sale } from "../models/sale.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { addCustSupValidation, updateCustSupValidation } from "../validations/custAndSup.validations.js";
import { addSaleValidation } from "../validations/salePurchase.validations.js";
import { CustomerTransactions } from "../models/customerTransactions.models.js";
import { addCashValidation } from "../validations/addCashValidation.validations.js";

const addCustomer = asyncHandler(async (req, res) => {
    console.log("req.body ", req.body);
    const { phone, cnic } = req.body
    console.log("req.file: ", req.file);

    const { error } = addCustSupValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let customer = await Customer.findOne({ $or: [{ phone }, { cnic }] })
    if (customer) {
        return res.status(401).send(new ApiError(401, "Customer already exists with this phone no or cnic"))
    }
    console.log("req.file: ", req.file);

    const profilesImageLocal = req.file?.path

    console.log("profilesImageLocal: ", profilesImageLocal, req.file);

    const profile_image = await uploadOnCloudinary(profilesImageLocal)

    if (!profile_image) {
        return res.status(400).send(new ApiError(400, "Profile image is required"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    customer = await Customer.create({
        ...req.body,
        profile_image: profile_image?.url,
        user_id,
        sub_admin_id
    })

    const createdCustomer = await Customer.findById(customer._id)

    if (!createdCustomer) {
        return res.status(500).send(new ApiError(500, "Something went wrong will creating customer"))
    }

    return res.json(new ApiResponse(200, createdCustomer, "Customer added successfully"))
})

const updateCustomer = asyncHandler(async (req, res) => {
    const { _id, phone, cnic } = req.body

    const { error } = updateCustSupValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let customer = await Customer.findById(_id)
    if (!customer) {
        return res.status(404).send(new ApiError(404, "Customer doesn't found"))
    }

    let profile_image;
    const profilesImageLocal = req.file?.path

    if (profilesImageLocal) {
        profile_image = await uploadOnCloudinary(profilesImageLocal)
        profile_image = profile_image?.url

        if (!profile_image) {
            return res.status(400).send(new ApiError(400, "Profile image is required"))
        }
    } else {
        profile_image = customer.profile_image
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    customer = await Customer.findByIdAndUpdate(
        customer._id,
        {
            ...req.body,
            profile_image,
            user_id,
            sub_admin_id
        },
        { new: true }
    )

    return res.json(new ApiResponse(200, customer, "Customer updated successfully"))
})

const getCustomers = asyncHandler(async (req, res) => {
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const customers = await Customer.find({ user_id })

    return res.json(new ApiResponse(200, customers, "Customers fetched successfully"))
})

const getCustomer = asyncHandler(async (req, res) => {
    const customer_id = req.params.id
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    console.log("customer_id: ", customer_id, user_id);

    const customer = await Customer.aggregate([
        {
            $match: {
                $and: [
                    { _id: new mongoose.Types.ObjectId(customer_id) },
                    { user_id: user_id }
                ]
            }
        },
        {
            $lookup: {
                from: "sales",
                localField: "_id",
                foreignField: "customer_id",
                as: "orders",
                pipeline: [
                    {
                        $addFields: {
                            date: {
                                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$date",
                            ordersPerDay: { $push: "$$ROOT" },
                            total_price: { $sum: "$price" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            date: "$_id",
                            ordersPerDay: 1,
                            total_price: 1
                        }
                    },
                    {
                        $addFields: {
                            transactions: {
                                $size: "$ordersPerDay"
                            }
                        }
                    },
                ]
            }
        },
        {
            $lookup: {
                from: "customertransactions",
                localField: "_id",
                foreignField: "customer_id",
                as: "transactions"
            }
        }
    ])

    console.log("customer: ", customer);

    return res.json(new ApiResponse(200, customer[0], "Customer fetched successfully"))
})

const updateCustomerStatus = asyncHandler(async (req, res) => {
    const customerId = req.params.id
    let customer = await Customer.findById(customerId)

    if (!customer) {
        return res.status(404).send(new ApiResponse(404, "Customer not found"))
    }

    const status = customer.status === 0 ? 1 : 0;

    customer = await Customer.findByIdAndUpdate(customer._id, { status }, { new: true })

    return res.json(new ApiResponse(200, customer, "Customer status updated successfully"))
})


const addSale = asyncHandler(async (req, res) => {
    // person_id is the customer_id
    const { total_amount, previous_amount, amount_added, person_id, amount_type } = req.body

    const { error } = addSaleValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let customer = await Customer.findById(person_id)
    if (!customer) {
        return res.status(404).send(new ApiError(404, "Customer not found"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    customer = await Customer.findByIdAndUpdate(
        customer._id,
        {
            amount: total_amount
        },
        { new: true }
    )

    const transaction = await CustomerTransactions.create({
        amount_type,
        remaining_amount: total_amount,
        previous_amount,
        amount_added,
        customer_id: customer._id,
        user_id,
        sub_admin_id
    })

    let sales = req.body.sales.map(sale => ({
        ...sale,
        user_id,
        sub_admin_id
    }));

    sales = await Sale.insertMany(sales)

    return res.json(new ApiResponse(200, sales, "Sales added successfully"))
})

const addCustomerCash = asyncHandler(async (req, res) => {
    // person_id is the customer_id
    const { remaining_amount, previous_amount, amount_added, person_id, amount_type } = req.body

    const { error } = addCashValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let customer = await Customer.findById(person_id)
    if (!customer) {
        return res.status(404).send(new ApiError(404, "Customer not found"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    customer = await Customer.findByIdAndUpdate(
        customer._id,
        {
            amount: remaining_amount
        },
        { new: true }
    )

    const transaction = await CustomerTransactions.create({
        amount_type,
        remaining_amount,
        previous_amount,
        amount_added,
        customer_id: customer._id,
        user_id,
        sub_admin_id
    })

    return res.json(new ApiResponse(200, customer, "Cash added successfully"))
})

const getCustomerTransactionReport = asyncHandler(async (req, res) => {

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    const customer_report = await Customer.aggregate([
        {
            $match: {
                user_id: user_id
            }
        },
        {
            $lookup: {
                from: 'customertransactions',
                localField: '_id',
                foreignField: 'customer_id',
                as: 'transaction',
                pipeline: [
                    {
                        $sort: {
                            'createdAt': -1
                        }
                    },
                ]
            },
        },
        {
            $addFields: {
                transaction: {
                    $first: "$transaction"
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: '$name' },
                address: { $first: '$address' },
                amount_added: { $first: '$transaction.amount_added' },
                previous_amount: { $first: '$transaction.previous_amount' },
                remaining_amount: { $first: '$transaction.remaining_amount' },
                customer_id: { $first: '$transaction.customer_id' }
            }
        }
    ])

    return res.json(new ApiResponse(200, customer_report, "Customer Report added successfully"))
})

export { addCustomer, updateCustomer, getCustomers, getCustomer, updateCustomerStatus, addSale, addCustomerCash, getCustomerTransactionReport }