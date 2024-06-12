import Joi from "joi";

const addSupTransactionValidation = {
    body: Joi.object({
        amount_type: Joi.string().required(),
        amount_added: Joi.number().required(),
        previous_amount: Joi.number().required(),
        remaining_amount: Joi.number().required(),
        supplier_id: Joi.string().required()
    })
}

const addCustTransactionValidation = {
    body: Joi.object({
        amount_type: Joi.string().required(),
        amount_added: Joi.number().required(),
        previous_amount: Joi.number().required(),
        remaining_amount: Joi.number().required(),
        customer_id: Joi.string().required()
    })
}

export { addSupTransactionValidation, addCustTransactionValidation }