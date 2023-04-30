import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import fs from 'fs'
import mongoose from 'mongoose'
import multer from "multer";
import cors from 'cors'

import {loginValidation, postCreateValidation, registerValidation} from "./validations/validations.js";
import checkAuth from "./utils/checkAuth.js";
import {getMe, login, register} from "./controllers/UserController.js";
import {create, getAll, getLastTags, getOne, remove, update} from "./controllers/PostController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('DB OK'))
    .catch((err) => console.log('DB error', err))

const app = express()

const storage = multer.diskStorage({
    destination: (_, __, callback) => {
        if(!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads')
        }
        callback(null, 'uploads')
    },
    filename: (_, file, callback) => {
        callback(null, file.originalname)
    },
})

const upload = multer({storage})

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // Update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json())
app.use(cors({
    origin: '*'
}))
app.use('/uploads', express.static('uploads'))

app.post('/auth/login', loginValidation, handleValidationErrors, login)
app.post("/auth/register", registerValidation, handleValidationErrors, register)
app.get('/auth/me', checkAuth, getMe)

app.post('/upload', checkAuth, upload.single("image"), (req, res) => {
    res.json({
        url: `uploads/${req.file.originalname}`
    })
})

app.get('/tags', getLastTags)

app.get('/posts', getAll)
app.get('/posts/tags', getLastTags)
app.get('/posts/:id',  getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, create)
app.delete('/posts/:id', checkAuth, remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, update)

app.listen(process.env.PORT || 4444 || 'http://localhost:4444/', (err) => {
    if (err) {
        return console.log(err)
    }

    console.log('Server OK')
})