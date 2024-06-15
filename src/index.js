import { app } from "./app.js";
import connectDb from "./db/index.js";
// import dotenv from "dotenv"
// dotenv.config({
//     path: '.env'
// })

const port = process.env.PORT || 2801

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log("App is listening on port ", port);
        })
    })
    .catch((err) => {
        console.log("Db connection failed", err);
    })