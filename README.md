# Apadana

**𐎠𐎱𐎭𐎠𐎴** **आपादन**

> Make your own short term rental website in minutes!

## Development

### 1. Get access

If you can see this, you have already access to the Git repository. If not, please request access.

You will need access to the following services to run the development environment:

- [Vercel](https://vercel.com/)
- [Clerk](https://clerk.com/)
- [UploadThing](https://uploadthing.com/)

### 2. Prepare your machine

<details>
  <summary style="cursor: pointer;">Install <a href="https://nodejs.org/en">Node.js</a>, <a href="https://pnpm.io/">pnpm</a>, <a href="https://vercel.com/docs/cli">Vercel CLI</a>, <a href="https://www.postgresql.org/download/">PostgreSQL</a>, and <a href="https://git-scm.com/downloads">Git</a></summary>

<details>
<summary><b style="cursor: pointer;">on MacOS</b></summary>

1. Install [Homebrew](https://brew.sh/)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install [Volta](https://volta.sh/) and using it to install `node` and `pnpm`
   ```bash
   curl https://get.volta.sh | bash
   volta install node
   volta install pnpm
   ```
3. Install [Vercel CLI](https://vercel.com/docs/cli) (v3.1.0 or higher)
   ```bash
   pnpm install -g vercel
   ```
4. Install [PostgreSQL](https://www.postgresql.org/download/) (v15.4 or higher)
   ```bash
   brew install postgresql
   ```
   [Homebrew documentation for installing PostgreSQL via `brew`](https://wiki.postgresql.org/wiki/Homebrew)
5. Install [Git](https://git-scm.com/downloads)
   ```bash
   brew install git
   ```

</details>

<details>
<summary><b style="cursor: pointer;"   >on Linux</b></summary>

1. Install [Node.js](https://nodejs.org/en) (v20.12.2 or higher)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
   sudo -E bash nodesource_setup.sh
   sudo apt-get install -y nodejs
   ```
2. Install [pnpm](https://pnpm.io/)
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | bash
   ```
3. Install [Vercel CLI](https://vercel.com/docs/cli) (v3.1.0 or higher)
   ```bash
   npm install -g vercel
   ```
4. Install [PostgreSQL](https://www.postgresql.org/download/) (v15.4 or higher)
   ```bash
   sudo apt-get install -y postgresql
   ```
5. Install [Git](https://git-scm.com/downloads)
   ```bash
   sudo apt-get install -y git
   ```

</details>

<details>
<summary><b style="cursor: pointer;">on Windows</b></summary>

We recommend using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) to run the development environment on Windows. With WSL, you can install Ubuntu and use the same commands as the Linux section.

</details>

</details>

### 3. Clone the repository

```bash
git clone git@github.com:mohsen1/apadana.git
```

### 4. Install dependencies

Use **pnpm** to install the dependencies.

```bash
pnpm install
```

### 5. Create a `.env.local` file

Running this command will create a `.env.local` file with the environment variables for the development environment.

```bash
vercel env pull
```

### 6. Run the development server

You can start the server using this command:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/pages/index.tsx`.

## Testing

### Unit testing

```bash
pnpm run test
```

When working on tests, you can use this command to run the tests and rerun them when you save the changes.

```bash
pnpm run test:watch
```

### E2E testing

```bash
pnpm run e2e
```

When working on E2E tests, first, makes sure your dev server is running, then, you can use this command to debug the tests.

```bash
pnpm run e2e:debug __PATH_TO_TEST_FILE__
```

This will launch Playwright browser in headed mode and also show you the Playwright debugger. Clicking on the ▶ button in the debugger will start the test execution.

## Database

You can use the following commands to manage the local database.

### Delete local database

This will delete the database if you want to start fresh.

```bash
pnpm run manage-db delete apadana
```

### Create local database

This will create a new database with the name `apadana`.

```bash
pnpm run manage-db create apadana
```

### Migrate local database

This will migrate the local database to the latest schema. If you have made changes to the schema, you can use this command to apply those changes to the database. You might need to run this command after creating a new database.

```bash
pnpm run migrate:dev
```

## Technology Stack Overview

This project is built on top of [Next.js](https://nextjs.org/) and is using [Next.js App Router](https://nextjs.org/docs/app).
The backend is using [PostgreSQL](https://www.postgresql.org/) and [Prisma](https://www.prisma.io/). To perform database operations, Prisma Client is used inside of [Next.js App Router Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations). Authentication is implemented using [Clerk](https://clerk.com/), we receive a webhook when a user signs up and create an account in our database. For storing media files, [UploadThing](https://uploadthing.com/) is used.

### Important Files and Folders

- `prisma/schema.prisma`: This file contains the schema for the database.
- `src/app/layout.tsx`: This file contains the main layout for the app.
- `src/app/api/uploadthing/core.ts`: This file contains the core logic for handling file uploads using UploadThing.
- `src/lib/prisma/client.ts`: This file contains the Prisma Client instance.
- `src/middleware.ts`: This file contains the main [Next.js middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) for the app.
