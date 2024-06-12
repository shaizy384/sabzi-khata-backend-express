import Joi from "joi";

const register = {
    body: Joi.object({
        email: Joi.string().required().email(),
        fullName: Joi.string().required(),
        password: Joi.string().required()
    })
}

const login = {
    body: Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    })
}

const addSubadminValidation = {
    body: Joi.object({
        email: Joi.string().required().email(),
        fullName: Joi.string().required(),
        password: Joi.string().required(),

        dashboard: Joi.number().required(),
        product: Joi.number().required(),
        supplier: Joi.number().required(),
        customer: Joi.number().required(),
        customer_report: Joi.number().required(),
        supplier_report: Joi.number().required(),
    })
}

// const updateSubadminValidation = {
//     body: Joi.object({
//         _id: Joi.string().required(),
//         email: Joi.string().required().email(),
//         fullName: Joi.string().required(),

//         dashboard: Joi.number().required(),
//         product: Joi.number().required(),
//         supplier: Joi.number().required(),
//         customer: Joi.number().required(),
//         customer_report: Joi.number().required(),
//         supplier_report: Joi.number().required(),
//     }).unknown(true);
// }

const deletedSubadminValidation = {
    params: Joi.object({
        id: Joi.string().required()
    })
}

export { register, login, addSubadminValidation, deletedSubadminValidation }