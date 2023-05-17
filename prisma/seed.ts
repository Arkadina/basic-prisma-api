import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
    {
        name: "Alice",
        email: "alice@prisma.io",
        posts: {
            create: [
                {
                    title: "Join the Prisma Slack",
                    content: "https://slack.prisma.io",
                    published: true,
                },
            ],
        },
    },
    {
        name: "Nilu",
        email: "nilu@prisma.io",
        posts: {
            create: [
                {
                    title: "Follow Prisma on Twitter",
                    content: "https://www.twitter.com/prisma",
                    published: true,
                },
            ],
        },
    },
    {
        name: "Mahmoud",
        email: "mahmoud@prisma.io",
        posts: {
            create: [
                {
                    title: "Ask a question about Prisma on GitHub",
                    content: "https://www.github.com/prisma/prisma/discussions",
                    published: true,
                },
                {
                    title: "Prisma on YouTube",
                    content: "https://pris.ly/youtube",
                },
            ],
        },
    },
];

async function main() {
    console.log("Starting seed");
    // É interessante notar que duas coleções são criadas: a dos usuários e a dos posts
    for await (const u of userData) {
        const user = prisma.user.create({
            data: u,
        });

        console.log(`Created user with id: ${(await user).id}`);
    }
    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect;
    })
    .catch(async (e) => {
        console.log(e);
        await prisma.$disconnect;
        process.exit(1);
    });
