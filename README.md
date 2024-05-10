# Invern Spirit Backend

## Get Started

To startup on this repo after cloning it, run the following command:

```npm run init```

This installs all dependencies and starts up husky as well.

To run the app locally, you can run the following command:

```npm run local```

This is a command that comprises 3 different commands:

```npm run build-local-db```:
Builds the local DB, following the db.sql fil inside db folder.

```npm run insert-local```:
Inserts mock products, collections and images inside the local DB, following the add-data.sql inside the db folder

``npx wrangler pages dev functions --d1 INVERN_DB=e5193edd-54a6-4b15-8e67-d0bd12b9afd2 --local-protocol=https --compatibility-date=2024-04-26``:
Compiles the code and runs a local server, incorporating it with the local DB and adding https connection

## Architecture

### The architecture of this repo follows the BCE architectural pattern:

- Boundaries: API endpoints responsible for receiving and responding to client HTTP events.
- Controllers: Modules responsible for processing the business logic behind the repo.
- Entities: Shared type definitions that support the repo's type safety.

### Additional layers added:

- Adapters: HTTP clients for external services, including the DB, KV namespaces and additional services that interact with the program.
- Utils: Utility functions that help reduce the complexity of code throughout the repo.

