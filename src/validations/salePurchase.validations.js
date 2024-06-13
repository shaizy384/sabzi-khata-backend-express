import Joi from "joi";

const sale = Joi.object({
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    product_id: Joi.string().required(),
    customer_id: Joi.string().required()
})

const purchase = Joi.object({
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    product_id: Joi.string().required(),
    supplier_id: Joi.string().required()
})

const addSaleValidation = {
    body: Joi.object({
        total_amount: Joi.number().required(),
        sales: Joi.array().items(sale)
    })
}

const addPurchaseValidation = {
    body: Joi.object({
        total_amount: Joi.number().required(),
        purchases: Joi.array().items(purchase)
    })
}

export { addSaleValidation, addPurchaseValidation }