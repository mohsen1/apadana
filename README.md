# Apadana

**𐎠𐎱𐎭𐎠𐎴** **आपादन**

> Make your own short term rental website in minutes!

## Design Principles

- **Minimalism**:
  - We believe in simplicity and focus on the core functionality of the website.
  - Single `package.json` file for the entire project.
- **Technology choice**:
  - We use more common technologies and libraries.
  - This is not a place for experimental technologies.
- **Easy deployment**:
  - Development works offline. No internet connection is required
  - Sending emails and uploading files are handled by mock services in development.
- **Solid infrastructure**:
  - We use AWS to build a solid infrastructure that is easy to manage and scale.
  - AWS infrastructure is deployed using AWS CDK.
- **Testing**:
  - We use E2E testing to ensure the website works as expected.
  - Instead of unit testing React components, we use visual testing to ensure the UI works as expected and e2e testing to ensure the components work together as expected.

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
3. Install [Task](https://taskfile.dev/)
   ```bash
   brew install go-task/tap/go-task
   ```
4. Install [Vercel CLI](https://vercel.com/docs/cli) (v3.1.0 or higher)
   ```bash
   pnpm install -g vercel
   ```
5. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
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
6. Install [Git](https://git-scm.com/downloads)
   ```bash
   brew install git
   ```

</details>

<details>
<summary><b style="cursor: pointer;">on Linux</b></summary>

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
3. Install [Task](https://taskfile.dev/)
   ```bash
   sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b ~/.local/bin
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

Alternatively, if you want to use Windows natively:

1. Install [Task](https://taskfile.dev/) using [Scoop](https://scoop.sh/):
   ```powershell
   scoop install task
   ```
   Or using [Chocolatey](https://chocolatey.org/):
   ```powershell
   choco install go-task
   ```

Then follow the Linux installation steps for other dependencies within WSL.

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
task start
```

The development environment includes default values for all required environment variables, so you can start developing right away.

Production environment variables are stored in Vercel dashboard.

Navigate to [http://dev.apadana.local](http://dev.apadana.local) to see the development website.

To stop the services:

```bash
task docker:down
```

To clean up everything including volumes:

```bash
task docker:clean
```

## Available Tasks

We use [Task](https://taskfile.dev) for running commands. Run `task --list` to see all available tasks. The `task` command is automatically added to your PATH during installation.

Here are the most commonly used tasks:

### Development

- `task dev` - Start development environment (Next.js, Prisma, Storybook)
- `task build` - Build the application
- `task typecheck` - Run TypeScript type checking
- `task fix:all` - Fix all code issues (linting and formatting)

### Testing

- `task test:all` - Run all tests in parallel
- `task test:e2e` - Run E2E tests
- `task test:unit` - Run unit tests
- `task test:storybook` - Run Storybook tests

### Docker

- `task docker:dev` - Start development Docker environment
- `task docker:prod` - Start production Docker environment
- `task docker:clean` - Clean Docker volumes
- `task docker:prune` - Remove all unused Docker resources

### Database

- `task prisma:generate` - Generate Prisma client
- `task prisma:migrate` - Run database migrations
- `task prisma:seed` - Seed the database

### AWS CDK

- `task cdk:deploy` - Deploy CDK stack
- `task cdk:destroy` - Destroy CDK stack
- `task cdk:diff` - Show CDK changes

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
