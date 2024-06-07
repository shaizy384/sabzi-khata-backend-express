import { app } from "./app.js";
import dotenv from "dotenv"
import connectDb from "./db/index.js";
dotenv.config()

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