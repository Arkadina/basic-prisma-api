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

// create post

app.post("/post", async (req: Request, res: Response) => {
    try {
        const { title, content, authorEmail } = req.body;

        const result = await prisma.post.create({
            data: {
                title,
                content,
                // relaciona o autor com o email do usuário
                author: { connect: { email: authorEmail } },
            },
        });

        return res.status(200).send(result);
    } catch (err: any) {
        return res.status(400).send(err.meta.cause);
    }
});

// find the post and increment the value of viewCount by 1
app.put("/post/:id/views", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await prisma.post.update({
            where: {
                id: id,
            },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });

        return res.status(200).send(result);
    } catch (err: any) {
        return res.json({
            error: `Post with ID ${id} does not exist in the database`,
        });
    }
});

app.put("/publish/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const postData = await prisma.post.findUnique({
            where: {
                id,
            },
            select: {
                published: true,
            },
        });

        const updatedPost = await prisma.post.update({
            where: {
                id,
            },
            data: {
                published: !postData?.published,
            },
        });

        return res.status(200).send(updatedPost);
    } catch (err: any) {
        return res.json({
            error: `Post with ID ${id} does not exist in the database`,
        });
    }
});

// delete a post
app.delete("/post/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await prisma.post.delete({
            where: {
                id,
            },
        });

        return res.status(200).send();
    } catch (err: any) {
        return res.json({
            error: `Post with ID ${id} does not exist in the database`,
        });
    }
});

// get all users
app.get("/users", async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.status(200).send(users);
});

// get the user's unpublished posts
app.get("/user/:id/drafts", async (req: Request, res: Response) => {
    const { id } = req.params;

    const drafts = await prisma.user
        .findUnique({
            where: {
                id,
            },
        })
        .posts({
            where: {
                published: false,
            },
        });

    if (drafts === null) {
        return res.sendStatus(400);
    }

    return res.status(200).send(drafts);
});


// find a post
app.get("/post/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
        where: { id: id },
    });

    if (post === null) {
        return res.sendStatus(400);
    }

    return res.status(200).send(post);
});

// get all posts
app.get("/feed", async (req: Request, res: Response) => {
    const { searchString, skip, take, orderBy } = req.query;
    // /feed?orderBy=desc&searchString=ora2&take=1&skip=0

    const or: Prisma.PostWhereInput = searchString
        ? {
              OR: [
                  { title: { contains: searchString as string } },
                  { content: { contains: searchString as string } },
              ],
          }
        : {};

    const posts = await prisma.post.findMany({
        where: {
            published: true,
            ...or,
        },
        include: { author: true },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
            updatedAt: orderBy as Prisma.SortOrder,
        },
    });

    return res.send(posts);
});

app.listen(3000, () => {
    console.log(`Server is listen port 3000`);
});
