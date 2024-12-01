# Apadana

**𐎠𐎱𐎭𐎠𐎴** **आपादन**

> Make your own short term rental website in minutes!

## Development

### 1. Get access

If you can see this, you have already access to the Git repository. If not, please request access.

You will need access to the following services to run the development environment:

- [Github](https://github.com/mohsen1/apadana) **required** to push code
- [Vercel](https://vercel.com/) **required** to deploy
- [UploadThing](https://uploadthing.com/) optional for media uploads
- [Neon](https://neon.tech/) optional for PostgreSQL database management

### 2. Prepare your machine

<details>
  <summary style="cursor: pointer;">Install <a href="https://nodejs.org/en">Node.js</a>, <a href="https://pnpm.io/">pnpm</a>, <a href="https://vercel.com/docs/cli">Vercel CLI</a>, <a href="https://www.docker.com/get-started">Docker</a>, and <a href="https://git-scm.com/downloads">Git</a> on your machine. Click to expand for instructions.</summary>

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
4. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   ```bash
   brew install --cask docker
   ```
   After installation:
   - Launch Docker Desktop from your Applications folder
   - Wait for Docker Desktop to start completely
   - Docker Compose is included with Docker Desktop for Mac
   - Verify installation by running:
   ```bash
   docker compose version
   ```
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
   pnpm install -g vercel
   ```
4. Install [Docker](https://www.docker.com/get-started)
   ```bash
   sudo apt-get install -y docker
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

This will start all services (Next.js, PostgreSQL, Storybook, Prisma Studio) in Docker containers:

```bash
pnpm docker:dev
```

Navigate to [localhost:3000](http://localhost:3000) to see the development website.

To stop the services:

```bash
pnpm docker:down
```

To clean up everything including volumes:

```bash
pnpm docker:clean
```

## `package.json` scripts

All commands can be run using `pnpm run <command>` or just `pnpm <command>` for most commands.

### Docker Commands

- `docker:dev` - Starts all services (Next.js, PostgreSQL, Storybook, Prisma Studio) in Docker containers
- `docker:down` - Stops all Docker containers
- `docker:clean` - Stops containers and removes all volumes. Deletes the database.
- `docker:rebuild` - Rebuilds the app container without cache and starts services
- `docker:prune` - Removes all unused Docker resources (containers, networks, volumes). This is useful when you want to clean up your machine and start fresh.
- `docker:prod` - Starts production Docker environment. Note that we are not using Docker Compose for production. This is for testing the production build locally.
- `docker:prod:down` - Stops production Docker environment
- `docker:prod:logs` - Shows logs from production Docker environment
- `docker:prod:clean` - Stops production environment and removes volumes

### Development Commands

Most of these commands are used by the `docker:dev` command. You should prefer using the `docker:dev` command instead.

### Database Commands

Beside `migrate:dev`, you should use the `docker:*` commands to manage the database. You can delete the database and create a new one using the `docker:clean` command.

- `migrate:dev` - Runs database migrations in development. If you have made changes to the schema, you can use this command to apply those changes to the database. You will be asked to name the migration.
- `migrate:prod` - Deploys database migrations in production. Should not run this manually. Only the CI/CD pipeline will do this.
- `prisma:generate` - Generates Prisma client
- `prisma:watch` - Watches for Prisma schema changes and regenerates client

### Build & Start Commands

These commands are mostly used by the Docker images. You should prefer using the `docker:*` commands instead.

- `build` - Generates Prisma client and builds Next.js application. Use `docker:prod` to test the production build locally.
- `start` - Starts the production Next.js server. Use `docker:prod` to test the production build locally.

### Testing Commands

#### Unit Tests

- `test` - Runs Jest tests (unit tests)
- `test:watch` - Runs Jest tests in watch mode

#### E2E Tests

- `e2e` - Runs Playwright E2E tests in Chromium. Provide the `--debug` flag to launch the browser in headed mode.
- `e2e:ci` - Runs Playwright tests in CI environment. You should not run this locally.
- `e2e:prod` - Runs E2E tests against production environment. This runs the tests against the production website. Use with caution.

### Code Quality Commands

- `lint` - Runs ESLint
- `lint:fix` - Runs ESLint with auto-fix and formats code
- `lint:strict` - Runs ESLint with zero warnings allowed
- `typecheck` - Generates Prisma client and runs TypeScript type checking
- `format` - Formats code using Prettier
- `format:check` - Checks code formatting without making changes

### Storybook Commands

- `storybook` - Starts Storybook development server
- `build-storybook` - Builds Storybook for production

### Git Hooks

- `prepare` - Installs Husky git hooks

## Technology Stack Overview

This project is built on top of [Next.js](https://nextjs.org/) and is using [Next.js App Router](https://nextjs.org/docs/app).
The backend is using [PostgreSQL](https://www.postgresql.org/) and [Prisma](https://www.prisma.io/). To perform database operations, Prisma Client is used inside of [Next.js App Router Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations). Locally we use Docker to run the database and Prisma Studio to view the database. Authentication is implemented using using [Oslo](https://oslo.js.org) For storing media files, [UploadThing](https://uploadthing.com/) is used.

### Important Files and Folders

- `prisma/schema.prisma`: This file contains the schema for the database.
- `src/app/layout.tsx`: This file contains the main layout for the app.
- `src/app/api/uploadthing/core.ts`: This file contains the core logic for handling file uploads using UploadThing.
- `src/lib/prisma/client.ts`: This file contains the Prisma Client instance.
- `src/middleware.ts`: This file contains the main [Next.js middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) for the app.
