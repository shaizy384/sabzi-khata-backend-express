import Joi from "joi";

const addCustSupValidation = {
    body: Joi.object({
        name: Joi.string().required(),
        phone: Joi.number().required(),
        cnic: Joi.number().required(),
        address: Joi.string().required(),
        amount: Joi.number().required(),
        // profile_image: Joi.object().required(),
    })
}

const updateCustSupValidation = {
    body: Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.number().required(),
        cnic: Joi.number().required(),
        address: Joi.string().required(),
        amount: Joi.number().required(),
    }).unknown(true)
}

export { addCustSupValidation, updateCustSupValidation }