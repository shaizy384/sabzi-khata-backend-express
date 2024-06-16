import { Customer } from "../models/customer.models.js";
import { CustomerTransactions } from "../models/customerTransactions.models.js";
import { Purchase } from "../models/purchase.models.js";
import { Sale } from "../models/sale.models.js";
import { SupplierTransactions } from "../models/supplierTransactions.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getDashboardStats = asyncHandler(async (req, res) => {
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));

    const customerStats = await Customer.aggregate([
        {
            $match: { user_id }
        },
        {
            $group: {
                _id: null,
                total_persons: { $sum: 1 },
                total_amount: { $sum: "$amount" }
            }
        },
        {
            $project: { _id: 0 }
        }
    ])

    const today_sale = await CustomerTransactions.aggregate([
        {
            $match: {
                user_id,
                createdAt: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }
        },
        {
            $group: {
                _id: null,
                today_sale: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$amount_type", "credit"] },
                            then: "$amount_added",
                            else: 0
                        }
                    }
                },
                amount_received: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$amount_type", "debit"] },
                            then: "$amount_added",
                            else: 0
                        }
                    }
                }
            }
        },
        { $project: { _id: 0 } }
    ])

    const supplierStats = await Customer.aggregate([
        {
            $match: { user_id }
        },
        {
            $group: { _id: null, total_persons: { $sum: 1 }, total_amount: { $sum: "$amount" } }
        },
        {
            $project: { _id: 0 }
        }
    ])

    let today_purchases = await SupplierTransactions.aggregate([
        {
            $match: {
                user_id,
                createdAt: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }
        },
        {
            $group: {
                _id: null,
                today_sale: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$amount_type", "credit"] },
                            then: "$amount_added",
                            else: 0
                        }
                    }
                },
                amount_received: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$amount_type", "debit"] },
                            then: "$amount_added",
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                total_sales: { $ifNull: ["$total_sales", 0] },
                amount_received: { $ifNull: ["$amount_received", 0] }
            }
        }
    ])


    if (today_purchases?.length < 1) {
        today_purchases = [{
            amount_received: 0,
            today_sale: 0
        }]
    }
    if (today_sale?.length < 1) {
        today_sale = [{
            amount_received: 0,
            today_sale: 0
        }]
    }
    if (customerStats?.length < 1) {
        customerStats = [{
            total_persons: 0,
            total_amount: 0
        }]
    }
    if (supplierStats?.length < 1) {
        supplierStats = [{
            total_persons: 0,
            total_amount: 0
        }]
    }

    const data = {
        customerStats: {
            ...customerStats[0],
            ...today_sale[0]
        },
        supplierStats: {
            ...supplierStats[0],
            ...today_purchases[0],
        }
    }

    return res.send(new ApiResponse(200, data, "Dashboard stats fetched successfully"))
})

export { getDashboardStats }