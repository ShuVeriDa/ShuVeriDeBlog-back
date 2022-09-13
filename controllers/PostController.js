import PostSchema from '../models/Post.js'
import post from "../models/Post.js";
import {body} from "express-validator";


export const getLastTags = async (req, res) => {
    try {
        const posts = await PostSchema.find().limit(5).exec()

        const tags = posts
            .map((obj) => obj.tags)
            .flat()
            .slice(0, 5)

        res.json(tags)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostSchema.find().populate('user').exec()

        res.json(posts)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getOne = (req, res) => {
    try {
        const postId = req.params.id

        PostSchema.findOneAndUpdate({_id: postId}, {$inc: {viewsCount: 1}}, {returnDocument: 'after'},
            (error, doc) => {
                if (error) {
                    console.log(error)
                    return res.status(500).json({
                        message: "Не удалось вернуть статью"
                    })
                }

                if (!doc) {
                    return res.status(400).json({
                        message: "Статья не найдена"
                    })
                }

                res.json(doc)
            }
        ).populate('user')
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const remove = (req, res) => {
    try {
        const postId = req.params.id

        PostSchema.findOneAndDelete({
            _id: postId
        }, (error, doc) => {
            if (error) {
                console.log(error)
                return res.status(500).json({
                    message: "Не удалось удалить статью"
                })
            }

            if (!doc) {
                return res.status(404).json({
                    message: "Статья не найдена"
                })
            }

            res.json({
                success: true
            })
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const create = async (req, res) => {
    try {
        const doc = new PostSchema({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags.split(','),
            user: req.userId
        })

        const post = await doc.save()

        res.json(post)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось создать статью",
        })
    }
}

export const update = async (req, res) => {
    try {
        const postId = req.params.id

        await PostSchema.updateOne(
            {_id: postId},
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                user: req.userId,
                tags: req.body.tags.split(',')
            }
        )

        res.json({
            success: true
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Не удалось обновить статьи'
        })
    }
}