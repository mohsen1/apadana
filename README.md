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

Add the following content to the `.env.local` file values from Vercel Storage:

```env
DATABASE_URL=...
```

### 4. Run the development server

You can start the server using this command:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/pages/index.tsx`.
