import Joi from "joi";

const addProductValidation = {
    body: Joi.object({
        name: Joi.string().required(),
        unit: Joi.string().required(),
    })
}

const updateProductValidation = {
    body: Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        unit: Joi.string().required(),
    }).unknown(true)
}

export { addProductValidation, updateProductValidation }