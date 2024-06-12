import { Customer } from "../models/customer.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { addCustSupValidation, updateCustSupValidation } from "../validations/custAndSup.validations.js";

const addCustomer = asyncHandler(async (req, res) => {
    const { phone, cnic } = req.body

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

export { addCustomer, updateCustomer, getCustomers, updateCustomerStatus }