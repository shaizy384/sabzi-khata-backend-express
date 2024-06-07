import mongoose from "mongoose"
import { DATABASE_NAME } from "../constants.js"

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DATABASE_NAME}`)
        console.log("Database connected, db host: ", connectionInstance.connection.host);
    } catch (error) {
        console.log("Database connection failed ", error);
        process.exit(1);
    }
}

export default connectDb