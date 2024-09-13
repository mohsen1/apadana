# Apadana

**𐎠𐎱𐎭𐎠𐎴** **आपादन**

> Make your own short term rental website in minutes!

### 0. Prepare your machine

<details>
  <summary>Install <a href="https://nodejs.org/en">Node.js</a>, <a href="https://pnpm.io/">pnpm</a>, <a href="https://vercel.com/docs/cli">Vercel CLI</a>, <a href="https://www.postgresql.org/download/">PostgreSQL</a>, and <a href="https://git-scm.com/downloads">Git</a></summary>

#### Note:

Development environment setup is optimized for **macOS**.

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

### 1. Clone the repository

```bash
git clone git@github.com:mohsen1/apadana.git
```

### 2. Install dependencies

Use **pnpm** to install the dependencies.

```bash
pnpm install
```

### 3. Create a `.env.local` file

Download the Vercel CLI and run this command to get the database url:

```bash
pnpm install -g vercel # if you don't have the Vercel CLI
vercel env pull
```

### 4. Run the development server

You can start the server using this command:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/pages/index.tsx`.
