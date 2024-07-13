import mongoose from "mongoose";
import { Purchase } from "../models/purchase.models.js";
import { Supplier } from "../models/supplier.models.js";
import { SupplierTransactions } from "../models/supplierTransactions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { addCustSupValidation, updateCustSupValidation } from "../validations/custAndSup.validations.js";
import { addPurchaseValidation } from "../validations/salePurchase.validations.js";
import { addCashValidation } from "../validations/addCashValidation.validations.js";

const addSupplier = asyncHandler(async (req, res) => {
    const { phone, cnic } = req.body

    const { error } = addCustSupValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let supplier = await Supplier.findOne({ $or: [{ phone }, { cnic }] })
    if (supplier) {
        return res.status(401).send(new ApiError(401, "Supplier already exists with this phone no or cnic"))
    }

    const profilesImageLocal = req.file?.path

    const profile_image = await uploadOnCloudinary(profilesImageLocal)

    if (!profile_image) {
        return res.status(400).send(new ApiError(400, "Profile image is required"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    supplier = await Supplier.create({
        ...req.body,
        profile_image: profile_image?.url,
        user_id,
        sub_admin_id
    })

    const createdSupplier = await Supplier.findById(supplier._id)

    if (!createdSupplier) {
        return res.status(500).send(new ApiError(500, "Something went wrong will creating supplier"))
    }

    return res.json(new ApiResponse(200, createdSupplier, "Supplier added successfully"))
})

const updateSupplier = asyncHandler(async (req, res) => {
    const { _id, phone, cnic } = req.body

    const { error } = updateCustSupValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let supplier = await Supplier.findById(_id)
    if (!supplier) {
        return res.status(404).send(new ApiError(404, "Supplier doesn't found"))
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
        profile_image = supplier.profile_image
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    supplier = await Supplier.findByIdAndUpdate(
        supplier._id,
        {
            ...req.body,
            profile_image,
            user_id,
            sub_admin_id
        },
        { new: true }
    )

    return res.json(new ApiResponse(200, supplier, "Supplier updated successfully"))
})

const getSuppliers = asyncHandler(async (req, res) => {
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const suppliers = await Supplier.find({ user_id })

    return res.json(new ApiResponse(200, suppliers, "Suppliers fetched successfully"))
})

const getSupplier = asyncHandler(async (req, res) => {
    const supplier_id = req.params._id
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const supplier = await Supplier.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        { user_id },
                        { _id: new mongoose.Types.ObjectId(supplier_id) }
                    ]
                }
            }
        },
        {
            $lookup: {
                from: "purchases",
                localField: "_id",
                foreignField: "supplier_id",
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
                from: "suppliertransactions",
                localField: "_id",
                foreignField: "supplier_id",
                as: "transactions"
            }
        }
    ])

    return res.json(new ApiResponse(200, supplier[0], "Supplier fetched successfully"))
})

const updateSupplierStatus = asyncHandler(async (req, res) => {
    const supplierId = req.params.id
    let supplier = await Supplier.findById(supplierId)

    if (!supplier) {
        return res.status(404).send(new ApiResponse(404, "Supplier not found"))
    }

    const status = supplier.status === 0 ? 1 : 0;

    supplier = await Supplier.findByIdAndUpdate(supplierId, { status }, { new: true })

    return res.json(new ApiResponse(200, supplier, "Supplier status updated successfully"))
})

const addPurchase = asyncHandler(async (req, res) => {
    // person_id is the supplier_id
    const { total_amount, previous_amount, amount_added, person_id, amount_type } = req.body

    const { error } = addPurchaseValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let supplier = await Supplier.findById(person_id)
    if (!supplier) {
        return res.status(404).send(new ApiError(404, "Supplier not found"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    supplier = await Supplier.findByIdAndUpdate(
        supplier._id,
        {
            amount: total_amount
        },
        { new: true }
    )

    const transaction = await SupplierTransactions.create({
        amount_type,
        remaining_amount: total_amount,
        previous_amount,
        amount_added,
        supplier_id: supplier._id,
        user_id,
        sub_admin_id
    })

    let purchases = req.body.sales.map(sale => ({
        ...sale,
        user_id,
        sub_admin_id
    }));

    purchases = await Purchase.insertMany(purchases)

    return res.json(new ApiResponse(200, purchases, "Purchases added successfully"))
})

const addSupplierCash = asyncHandler(async (req, res) => {
    // person_id is the supplier_id
    const { remaining_amount, previous_amount, amount_added, person_id, amount_type } = req.body

    const { error } = addCashValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    let supplier = await Supplier.findById(person_id)
    if (!supplier) {
        return res.status(404).send(new ApiError(404, "Supplier not found"))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    supplier = await Supplier.findByIdAndUpdate(
        supplier._id,
        {
            amount: remaining_amount
        },
        { new: true }
    )

    const transaction = await SupplierTransactions.create({
        amount_type,
        remaining_amount,
        previous_amount,
        amount_added,
        supplier_id: supplier._id,
        user_id,
        sub_admin_id
    })

    return res.json(new ApiResponse(200, supplier, "Cash added successfully"))
})

const getSupplierTransactionReport = asyncHandler(async (req, res) => {

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    const supplier_report = await Supplier.aggregate([
        {
            $match: {
                user_id: user_id
            }
        },
        {
            $lookup: {
                from: 'suppliertransactions',
                localField: '_id',
                foreignField: 'supplier_id',
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
                supplier_id: { $first: '$transaction.supplier_id' }
            }
        }
    ])

    return res.json(new ApiResponse(200, supplier_report, "Customer Report added successfully"))
})

export { addSupplier, updateSupplier, getSuppliers, getSupplier, updateSupplierStatus, addPurchase, addSupplierCash, getSupplierTransactionReport }