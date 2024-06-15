import Joi from "joi";

const sale = Joi.object({
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    name: Joi.string().required(),
    product_id: Joi.string().required(),
    customer_id: Joi.string().required()
})

const purchase = Joi.object({
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    name: Joi.string().required(),
    product_id: Joi.string().required(),
    supplier_id: Joi.string().required()
})

const addSaleValidation = {
    body: Joi.object({
        total_amount: Joi.number().required(),
        previous_amount: Joi.number().required(),
        amount_added: Joi.number().required(),
        person_id: Joi.string().required(),
        amount_type: Joi.string().required(),
        sales: Joi.array().items(sale)
    })
}

const addPurchaseValidation = {
    body: Joi.object({
        total_amount: Joi.number().required(),
        previous_amount: Joi.number().required(),
        amount_added: Joi.number().required(),
        person_id: Joi.string().required(),
        amount_type: Joi.string().required(),
        sales: Joi.array().items(purchase)
    })
}

export { addSaleValidation, addPurchaseValidation }