import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilepath) => {
    try {
        console.log("cloudinary config: ", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
        console.log("localFilepath ", localFilepath);
        const response = await cloudinary.uploader.upload(localFilepath, {
            resource_type: "auto"
        });
        console.log("response.url: ", response.url);

        fs.unlinkSync(localFilepath)
        return response
    } catch (error) {
        console.log("cloudFilepath error: ", error);
        fs.unlinkSync(localFilepath)
        return null;
    }
}

export { uploadOnCloudinary }
