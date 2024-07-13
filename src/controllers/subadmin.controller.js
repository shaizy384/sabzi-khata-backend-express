import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addSubadminValidation, deletedSubadminValidation, updateSubPasswordValidation, updateSubadminValidation } from "../validations/user.validations.js";

const addSubadmin = asyncHandler(async (req, res) => {
    const { email } = req.body

    const { error } = addSubadminValidation.body.validate(req.body);
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const isSubadminExist = await User.findOne({ email })
    if (isSubadminExist) {
        return res.status(400).send(new ApiError(400, "Subadmin already exists"))
    }
    const subadmin = await User.create({
        ...req.body,
        admin_roles: 0,
        isAdmin: false,
        user_id: req.user._id,
    })

    const createdSubadmin = await User.findById(subadmin._id).select("-password -refreshToken")

    if (!createdSubadmin) {
        return res.status(500).send(new ApiError(500, "Something went wrong while adding subadmin"))
    }

    return res.json(new ApiResponse(200, createdSubadmin, "Subadmin is registered successfully"))
})

const getSubadmins = asyncHandler(async (req, res) => {
    const user_id = req.user.isAdmin ? req.user._id : req.user.user_id;

    const subadmins = await User.find({ $and: [{ user_id }, { isAdmin: false }] }).select("-password -refreshToken")

    return res.json(new ApiResponse(200, subadmins, "Subadmins fetched successfully"))
})

const updateSubadmin = asyncHandler(async (req, res) => {

    const { error } = updateSubadminValidation.body.validate(req.body);
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const { _id } = req.body

    const subadmin = await User.findByIdAndUpdate(
        _id,
        {
            ...req.body,
            admin_roles: 0,
            isAdmin: false,
            // user_id: req.user._id,
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!subadmin) {
        return res.status(404).send(new ApiError(404, "Subadmin not exists"))
    }

    return res.json(new ApiResponse(200, subadmin, "Subadmin updated successfully"))
})

const updateSubadminPassword = asyncHandler(async (req, res) => {

    const { error } = updateSubPasswordValidation.body.validate(req.body);
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const { _id, password } = req.body

    const subadmin = await User.findByIdAndUpdate(
        _id,
        {
            password
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!subadmin) {
        return res.status(404).send(new ApiError(404, "Subadmin not exists"))
    }

    return res.json(new ApiResponse(200, subadmin, "Subadmin password updated successfully"))
})

const deleteSubadmin = asyncHandler(async (req, res) => {

    const { error } = deletedSubadminValidation.params.validate(req.params);
    if (error) {
        return res.status(400).send(new ApiError(400, error.details[0].message))
    }

    const deletedSubadmin = await User.findByIdAndDelete(req.params.id)

    if (!deletedSubadmin) {
        return res.status(404).send(new ApiError(404, "Subadmin not exists"))
    }

    return res.send(new ApiResponse(200, deletedSubadmin, "Saubadmin deleted successfully"))
})

export { addSubadmin, getSubadmins, updateSubadmin, updateSubadminPassword, deleteSubadmin }