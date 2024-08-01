# todolist-passkey

This is a Simple Todo List App with Passkey authentication.

## Prerequisites

- Node.js
- pnpm

## Installation

1. Clone the repository:

```sh
git clone https://github.com/loishi/todolist-passkey
cd todo-passkey-app
```

2. Install dependencies:

```sh
pnpm i
```

3. Set up the environment variables:

Create a `.env` file in the root directory and add the following:

```
DATABASE_URL="file:./dev.db"
RP_ID="localhost"
EXPECTED_ORIGIN="http://localhost:3000"
SESSION_SECRET="your-secret-key"
```

4. Set up the database:

```sh
pnpm prisma generate
pnpm prisma db push
```

## Running the Application

To run the application in development mode:
```sh
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## Scripts

- `pnpm run dev`: Start the development server
- `pnpm run build`: Build the TypeScript files
- `pnpm start`: Start the production server
- `pnpm run lint`: Run Biome linter
- `pnpm run format`: Format code using Biome

## Project Structure
```
├── LICENSE
├── README.md
├── prisma
│   └── schema.prisma
├── public
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src
│   ├── db.ts
│   ├── routes
│   │   ├── auth.ts
│   │   └── todos.ts
│   ├── server.ts
│   └── types.ts
├── biome.json
├── package.json
└── tsconfig.json
```

## License

This project is licensed under the MIT License.