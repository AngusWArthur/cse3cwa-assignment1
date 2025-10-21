This code was written with the assistance of ChatGPT which helped provide the layout and the basic features for the site and which I then tailored.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## View Docker image
```bash
docker compose build
docker compose up
```

## View Database Tabsets
-- With environment running

# Via API
Go to http://localhost:3000/api/tabsets

# Via Prisma Studio
```bash
docker compose up -d #or while environment running
docker compose exec web sh -lc 'npx prisma studio --port 5555 --hostname 0.0.0.0'
# this will open the Prisma GUI at port 5555

```

## Vitest Tests - Unit Tests
```bash
# does not require server to be running
npm run test
```

## Playwright Tests - End to End Browser Tests
```bash
# will require server (dev/docker/prod) to be running
# install browsers once
npx playwright install

# run headless
npm run test:e2e
```


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
