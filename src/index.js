import { app } from "./app.js";
import connectDb from "./db/index.js";

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