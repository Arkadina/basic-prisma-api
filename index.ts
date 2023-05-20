const express = require("express");
const app = express();
import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

app.use(express.json());

// create account
app.post("/signup", async (req: Request, res: Response) => {
    const { name, email, posts } = req.body;

    // {
    //     "email": "prisma@gmail.com",
    //     "name": "Prisma",
    //     "posts": [
    //         {
    //             "title": "post title",
    //             "content": "post content"
    //         }
    //     ]
    // }

    const findUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (findUser === null) {
        const postData = posts?.map((post: Prisma.PostCreateInput) => {
            return {
                title: post?.title,
                content: post?.content,
            };
        });

        const result = await prisma.user.create({
            data: {
                name,
                email,
                posts: {
                    create: postData,
                },
            },
        });

        return res.status(200).send(result);
    }

    return res.status(400).json({ error: "Email has already been taken" });
});

app.listen(3000, () => {
    console.log(`Server is listen port 3000`);
});
