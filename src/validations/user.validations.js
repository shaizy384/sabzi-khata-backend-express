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

export { register, login }