# Invern Spirit Backend

## Overview
Invern Spirit Backend is the server-side component of the Invern Spirit ecommerce application, designed to handle the core business logic, data management, and API endpoints. This backend service ensures seamless communication between the frontend interface and the underlying database, providing a robust foundation for the application's functionality.

## Features
- **API Endpoints**: Provides a set of RESTful API endpoints for client applications to interact with the system.
- **Database Integration**: Utilizes a relational database to store and manage application data efficiently.
- **Authentication**: Implements user authentication mechanisms to secure access to the application's resources.
- **Validation**: Includes data validation to ensure the integrity and reliability of the information processed.
- **Payment Gateway Integration**: Integrates with payment gateways to facilitate secure transactions within the application.
- **Order Management**: Manages the lifecycle of orders, from creation to fulfillment, to provide a seamless shopping experience.
- **Product Catalog**: Maintains a catalog of products with detailed information to enable product discovery and selection.
- **Inventory Management**: Tracks product inventory levels to prevent stock outs and manage supply chain operations.
- **User Management**: Manages user accounts, profiles and access rights to personalize the user experience.
- **Monitoring and Observability**: Generates logs to provide insights into application health, sales performance and customer behavior.

## Technologies Used
- **Cloudflare Workers + Hono**: Serverless runtime (workerd) and the Hono web framework the API is built on. `nodejs_compat` is enabled for Node built-ins.
- **TypeScript**: Superset of JavaScript that adds static typing, enhancing code quality and maintainability.
- **Cloudflare D1 (SQLite)**: The database — a serverless SQLite accessed via a Workers binding (no local database server or Docker required; `wrangler dev` runs an embedded local D1).
- **Cloudflare KV + R2**: KV namespaces (auth/validation/stock caches) and an R2 bucket (stock source of truth) via Workers bindings.
- **Drizzle ORM**: Lightweight TypeScript ORM for interacting with D1.
- **Stripe**: Payment processing (Checkout + webhooks).
- **Brevo**: Transactional email provider (`libs/adapters/brevo`).
- **Zod**: TypeScript-first schema validation library with static type inference, providing robust data validation and type checking throughout the application.
- **Turbo + npm workspaces**: This repo is a monorepo (`apps/backend` + shared `libs/*`); `turbo` runs the build/lint/test/type-check task graph.
- **Jest**: Testing framework used to write and run unit tests, ensuring code reliability.
- **Husky**: Git hooks manager that enforces code quality checks before commits and pushes.

## Getting Started
Follow these instructions to set up and run the project on your local machine.

### Prerequisites
- **Node.js**: Ensure you have Node.js installed (matching the version in CI). You can download it from the official website.
- **npm**: Node.js package manager, which comes bundled with Node.js. Wrangler (the Cloudflare CLI) is installed as a dev dependency — no global install needed.

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/manuelfesantos/invern-be.git
   ```

2. **Navigate to the Project Directory**:
   ```bash
   cd invern-be
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Apply Database Migrations (local D1)**:
   ```bash
   npm run db:migrate:local
   ```
   This creates the local D1 schema (no separate database server — it's embedded in `wrangler dev`).

### Environment Variables
The application requires specific environment variables to function correctly.

1. **Create a .dev.vars File**:
   ```bash
   cp .env.example .dev.vars
   ```

2. **Configure the Variables**:
   Open the `.dev.vars` file and replace the placeholder values with your actual configuration settings.

### Infrastructure & configuration
- **Bindings are version-controlled.** `wrangler.toml` (repo root, used by the root-level D1 CLI scripts — migrate/seed/query) and `apps/backend/wrangler.jsonc` (the Worker) hold the D1 database, R2 bucket, KV namespaces and rate-limit bindings. These contain **resource ids/names only — never secrets**.
- **Secrets** live in `.dev.vars` locally (gitignored) and in Cloudflare (dashboard / `wrangler secret`) for `preview`/`production` — never in the wrangler config or the repo.
- **Environments:** `local` (wrangler dev), `preview` (staging), `production`, mapped to the `preview` and `main` branches respectively.

## Running the Application
**Start the Development Server**:
```bash
npm run start
```
This runs the backend Worker locally via `wrangler dev` (with an embedded local D1, KV and R2), with hot-reloading. It reads runtime vars from `apps/backend/.dev.vars` (symlinked to the repo-root `.dev.vars`).

### First-Time Setup
When running the application for the first time, you need to complete two additional steps:

1. **Populate the Database**:
   Run the seed script (idempotent — safe to re-run):
   ```bash
   npm run seed              # seeds the local D1
   # npm run seed -- --env=preview --yes   # remote (preview/prod) needs --yes
   ```
   This populates your database with the necessary initial data (collections,
   products, images, currencies, countries, taxes, shipping methods/rates).
   See `scripts/seed.mjs` for options (`--env`, `--database`, `--dry-run`).


2. **Initialize Stock Bucket**:
   Make a POST request to:
   ```
   /private/stock/setup
   ```
   Include a JSON body with the `secretKey` property matching the value in your `SETUP_STOCK_SECRET` environment variable:
   ```json
   {
     "secretKey": "your-setup-stock-secret-value"
   }
   ```
   This will initialize the local stock bucket required for the application to function properly.

3. **Create an admin user**:
   Admin (`/private/*`) access requires a user with `role = ADMIN`. New signups
   are always `USER`, so create the first admin explicitly:
   ```bash
   npm run create-admin -- --email=you@example.com --password='a-strong-password'
   # remote: npm run create-admin -- --email=... --password=... --env=preview --yes
   ```
   Upserts on email (re-running resets the password). See `scripts/create-admin.mjs`.

## Database Migration

1. **Generate the migration files**:
    ```bash
    npm run db:generate
    ```
2. **Apply the migration**:
    - Local
        ```bash
        npm run db:migrate:local
        ```
    - Remote
        ```bash
        npm run db:migrate:remote
        ```
      This requires you to be logged in to your account via wrangler.
      ```bash
      npx wrangler login
      ```

## API Overview

### Authentication

Many endpoints require authentication with a JWT token provided in the `Authorization` header:

```
Authorization: Bearer {access-token}
```

### Public Endpoints

#### Countries

| Endpoint                         | Method | Description                        |
|----------------------------------|--------|------------------------------------|
| `/public/countries`              | GET    | Retrieve all available countries   |
| `/public/countries/:countryCode` | GET    | Get details for a specific country |

#### Configuration

| Endpoint                                | Method | Description                                                                                                         |
|-----------------------------------------|--------|---------------------------------------------------------------------------------------------------------------------|
| `/public/countries/:countryCode/config` | GET    | Get initial values for interacting with the API, including shopping cart, user if logged in and authorization token |

#### Products

| Endpoint                                      | Method | Description                                     |
|-----------------------------------------------|--------|-------------------------------------------------|
| `/public/countries/:countryCode/products`     | GET    | Get all products (supports search parameter)    |
| `/public/countries/:countryCode/products/:id` | GET    | Get detailed information for a specific product |

#### Collections

| Endpoint                                         | Method | Description                                        |
|--------------------------------------------------|--------|----------------------------------------------------|
| `/public/countries/:countryCode/collections`     | GET    | Get all product collections                        |
| `/public/countries/:countryCode/collections/:id` | GET    | Get detailed information for a specific collection |

#### Cart Management

*Authentication required*

| Endpoint                                               | Method | Description                                                         |
|--------------------------------------------------------|--------|---------------------------------------------------------------------|
| `/public/countries/:countryCode/cart`                  | GET    | Retrieve the current user's cart                                    |
| `/public/countries/:countryCode/cart/items/:productId` | PATCH  | Add a quantity to a product in the cart (requires quantity in body) |
| `/public/countries/:countryCode/cart/items/:productId` | PUT    | Update product quantity in cart (requires quantity in body)         |
| `/public/countries/:countryCode/cart/items/:productId` | DELETE | Remove a product from the cart                                      |

#### Checkout Process

*Authentication required*

| Endpoint                                         | Method | Description                   |
|--------------------------------------------------|--------|-------------------------------|
| `/public/countries/:countryCode/checkout/stages` | GET    | Get available checkout stages |

##### Personal Details

| Endpoint                                                          | Method | Description                                          |
|-------------------------------------------------------------------|--------|------------------------------------------------------|
| `/public/countries/:countryCode/checkout/stages/personal-details` | GET    | Get user's personal details                          |
| `/public/countries/:countryCode/checkout/stages/personal-details` | POST   | Save personal details (first name, last name, email) |

##### Address

| Endpoint                                                 | Method | Description                       |
|----------------------------------------------------------|--------|-----------------------------------|
| `/public/countries/:countryCode/checkout/stages/address` | GET    | Get saved address information     |
| `/public/countries/:countryCode/checkout/stages/address` | POST   | Create or update shipping address |

##### Shipping

| Endpoint                                                  | Method | Description                                    |
|-----------------------------------------------------------|--------|------------------------------------------------|
| `/public/countries/:countryCode/checkout/stages/shipping` | GET    | Get available shipping methods                 |
| `/public/countries/:countryCode/checkout/stages/shipping` | POST   | Select a shipping method (requires ID in body) |

##### Payment

| Endpoint                                                 | Method | Description             |
|----------------------------------------------------------|--------|-------------------------|
| `/public/countries/:countryCode/checkout/stages/payment` | GET    | Get payment session url |

##### Review

| Endpoint                                                | Method | Description                                               |
|---------------------------------------------------------|--------|-----------------------------------------------------------|
| `/public/countries/:countryCode/checkout/stages/review` | GET    | Get order review information before proceeding to payment |

#### User Management

*Authorization Required*

##### Authentication

| Endpoint                                     | Method | Description                  |
|----------------------------------------------|--------|------------------------------|
| `/public/countries/:countryCode/user/signup` | POST   | Create a new user account    |
| `/public/countries/:countryCode/user/login`  | POST   | Login to an existing account |
| `/public/countries/:countryCode/user/logout` | POST   | Log out current user         |

##### User Profile

| Endpoint                              | Method | Description              |
|---------------------------------------|--------|--------------------------|
| `/public/countries/:countryCode/user` | GET    | Get current user profile |
| `/public/countries/:countryCode/user` | PUT    | Update user information  |
| `/public/countries/:countryCode/user` | DELETE | Delete user account      |

#### Orders

*Authentication required*

| Endpoint                                    | Method | Description                      |
|---------------------------------------------|--------|----------------------------------|
| `/public/countries/:countryCode/orders`     | GET    | Get all orders for current user  |
| `/public/countries/:countryCode/orders/:id` | GET    | Get details for a specific order |

### Private Endpoints

*These endpoints are for administrative or internal use only*

#### Stock Management

| Endpoint                    | Method | Description                         |
|-----------------------------|--------|-------------------------------------|
| `/private/stock/:productId` | GET    | Get stock information for a product |
| `/private/stock/setup`      | POST   | Initialize stock management system  |

#### Test Data

| Endpoint                 | Method | Description                          |
|--------------------------|--------|--------------------------------------|
| `/private/stock/setup`   | POST   | Initialise the stock bucket from D1  |

> Test data is seeded with the `npm run seed` script (`scripts/seed.mjs`), not
> an endpoint.

### Response Format

Responses typically follow a standard format:

```json
{
  "message": "Action description",
  "data": { "key": "value" }
}
```

Failed requests will return:

```json
{
  "issues": [
    "Error 1 description",
    "Error 2 description"
  ]
}
```

### Authentication Flow

1. Frontend calls config endpoint to get initial authorization tokens
2. User is now able to interact with shopping cart, checkout and order
2. User signs up or logs in using the appropriate endpoints
2. Upon successful authentication, the API returns a logged in access token
3. The logged in access token is used to access user-specific endpoints (user profile, orders, etc.)

## Testing
To run the test suite, execute:
```bash
npm test
```
This command runs all unit tests using Jest, ensuring that the application's functionalities work as intended.

## Contributing
We welcome contributions to enhance the Invern Spirit Backend. To contribute:

1. **Fork the Repository**: Click the "Fork" button on the GitHub page to create a personal copy of the repository.
2. **Create a New Branch**: Use a descriptive name for your branch.
3. **Make Changes**: Implement your features or bug fixes.
4. **Run Tests**: Ensure all tests pass before committing your changes.
5. **Commit Changes**: Write clear and concise commit messages.
6. **Push to GitHub**: Push your changes to your forked repository.
7. **Submit a Pull Request**: Describe your changes and submit the pull request for review.

## License
This project is licensed under the MIT License. For more details, refer to the LICENSE file.

## Acknowledgements
We extend our gratitude to all contributors and open-source projects that have made this project possible.