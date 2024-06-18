import Joi from "joi";

const addCashValidation = {
    body: Joi.object({
        amount_type: Joi.string().required(),
        amount_added: Joi.number().required(),
        previous_amount: Joi.number().required(),
        remaining_amount: Joi.number().required(),
        person_id: Joi.string().required()
    })
}

export { addCashValidation }