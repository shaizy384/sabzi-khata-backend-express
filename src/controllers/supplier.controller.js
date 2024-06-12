import { Supplier } from "../models/supplier.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { addCustSupValidation, updateCustSupValidation } from "../validations/custAndSup.validations.js";

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
    console.log("req.file: ", req.file);

    const profilesImageLocal = req.file?.path

    console.log("profilesImageLocal: ", profilesImageLocal, req.file);

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
    const suppliers = await Supplier.find({ user_id: req.user._id })

    return res.json(new ApiResponse(200, suppliers, "Suppliers fetched successfully"))
})

const updateSupplierStatus = asyncHandler(async (req, res) => {
    const userId = req.params.id
    let supplier = await Supplier.findById(userId)
    if (!supplier) {
        return res.status(404).send(new ApiResponse(404, "Supplier not found"))
    }

    const status = supplier.status === 0 ? 1 : 0;

    supplier = await Supplier.findByIdAndUpdate(userId, { status }, { new: true })

    return res.json(new ApiResponse(200, supplier, "Supplier status updated successfully"))
})

export { addSupplier, updateSupplier, getSuppliers, updateSupplierStatus }