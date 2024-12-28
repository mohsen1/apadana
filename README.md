# Apadana

**𐎠𐎱𐎭𐎠𐎴** **आपादन**

> Make your own short term rental website in minutes!

## Development

### 1. Get access

If you can see this, you have already access to the Git repository. If not, please request access.

You will need access to the following services to run the development environment:

- [Github](https://github.com/mohsen1/apadana) **required** to push code
- [Vercel](https://vercel.com/) **required** to deploy
- [Amazon AWS](https://aws.amazon.com/) Not required but recommended

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
3. Install [Docker](https://www.docker.com/get-started)
   ```bash
   sudo apt-get install -y docker
   ```
4. Install [Git](https://git-scm.com/downloads)
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

### 5. Pull development environment variables

> **Note**: You must be a member of the `apadana` team to pull the environment variables. If this is your first time, you will need `vercel login` and `vercel team add` to be able to pull the environment variables.

```bash
vercel env pull
```

### 6. Run the development server

This will start all services (Next.js, PostgreSQL, Storybook, Prisma Studio) in Docker containers:

> **Note**: The first time you run this command, it will ask for sudo permission to modify your `/etc/hosts` file to add local domain entries.

```bash
pnpm start
```

The development environment includes default values for all required environment variables, so you can start developing right away.

Production environment variables are stored in Vercel dashboard.

Navigate to [http://dev.apadana.local](http://dev.apadana.local) to see the development website.

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

Here are a few important commands:

### Main Commands

- `start` - Sets up local environment and starts all services using Docker Compose
- `build` - Generates Prisma client and builds Next.js application
- `fix` - Runs ESLint with auto-fix and formats code using Prettier

### Docker Commands

- `docker:prune` - Removes all unused Docker resources (containers, networks, volumes)
- `docker:clean` - Stops containers and removes all volumes
- `docker:down` - Stops all Docker containers

## Technology Stack Overview

This project is built on top of

- [Next.js](https://nextjs.org/) and is using [App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Zod](https://zod.dev/)
- [Next Safe Action](https://next-safe-action.dev)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)
- [Oslo](https://oslo.js.org)
- [AWS S3](https://aws.amazon.com/s3/)
- [AWS RDS](https://aws.amazon.com/rds/)
- [Resend](https://resend.com/)
- [Vercel](https://vercel.com/)
