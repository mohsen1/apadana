# Make your own listing website!

### 1. Clone the repository

```bash
git clone git@github.com:mohsen1/make-your-own-listing-site.git
```

### 2. Install dependencies

It is encouraged to use **pnpm** so the husky hooks can work properly.

```bash
pnpm install
```

### 3. Create a `.env.local` file

```bash
touch .env.local
```

Add the following content to the `.env.local` file values from [Vercel Storage](https://vercel.com/docs/storage/vercel-postgres):

```env
DATABASE_URL=...
```

And add [Clerk](https://clerk.com/) values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_******
CLERK_SECRET_KEY=sk_test_***
```

Add [Uploadthing](https://uploadthing.com/) values:

```env
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
```

### 4. Run the development server

You can start the server using this command:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/pages/index.tsx`.
