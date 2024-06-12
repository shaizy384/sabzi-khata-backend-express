import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addProductValidation, updateProductValidation } from "../validations/product.validations.js";

const addProduct = asyncHandler(async (req, res) => {

    const { error } = addProductValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    const product = await Product.create({
        ...req.body,
        user_id,
        sub_admin_id
    })

    const createdProduct = await Product.findById(product._id)

    if (!createdProduct) {
        return res.status(500).send(new ApiError(500, "Something went wrong will creating product"))
    }

    return res.json(new ApiResponse(200, createdProduct, "Product added successfully"))
})

const updateProduct = asyncHandler(async (req, res) => {

    const { error } = updateProductValidation.body.validate(req.body)
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id
    const sub_admin_id = req.user.isAdmin ? null : req.user._id

    const product = await Product.findByIdAndUpdate(
        req.body._id,
        {
            ...req.body,
            user_id,
            sub_admin_id
        },
        {
            new: true
        }
    )

    const createdProduct = await Product.findById(product._id)

    if (!createdProduct) {
        return res.status(500).send(new ApiError(500, "Something went wrong will creating product"))
    }

    return res.json(new ApiResponse(200, createdProduct, "Product added successfully"))
})

const getProducts = asyncHandler(async (req, res) => {

    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const products = await Product.find({ user_id })

    return res.json(new ApiResponse(200, products, "Products fetched successfully"))
})

const updateProductStatus = asyncHandler(async (req, res) => {
    const productId = req.params.id
    let product = await Product.findById(productId)
    if (!product) {
        return res.status(404).send(new ApiResponse(404, "Product not found"))
    }

    const status = product.status === 0 ? 1 : 0;

    product = await product.findByIdAndUpdate(userId, { status }, { new: true })

    return res.json(new ApiResponse(200, product, "Product status updated successfully"))
})

export { addProduct, updateProduct, getProducts, updateProductStatus }