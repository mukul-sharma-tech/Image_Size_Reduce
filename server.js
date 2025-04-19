import express from 'express';
import mongoose from 'mongoose';
const app = express();
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config(); // Load env variables from .env file
    // Configuration
    cloudinary.config({
        cloud_name: 'dggulw4uq',
        api_key: '383773851561917',
        api_secret: '77dSFXvQJVuoXgk2uH3m1zvAUTo' // Click 'View API Keys' above to copy your API secret
    });

const PORT = 1000;
// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views")); // Ensure Express finds the "views" folder


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.render('index.ejs', { url: null });
});

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    },

});

const upload = multer({storage: storage});

const imgSchema = new mongoose.Schema({
    filename: String,
    public_id: String,
    imgurl: String
});

const File = mongoose.model('ImageReducer', imgSchema);

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const { size } = req.body;
        let width = 1000; // Default width

        // Reduce width based on selected option
        if (size == "75") width = 750;
        else if (size == "50") width = 500;
        else if (size == "25") width = 250;

        const cloudinaryRes = await cloudinary.uploader.upload(req.file.path, {
            transformation: [{ width: width, crop: "scale" }]
        });

        // Delete uploaded file from local storage
        fs.unlinkSync(req.file.path);

        res.render("index", { url: cloudinaryRes.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).send("Upload failed");
    }
});



app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));