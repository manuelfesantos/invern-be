# Invern Spirit Backend

## Get Started

To startup on this repo after cloning it, run the following command:

```npm run init```

This installs all dependencies, starts up husky and builds the local database.

To run the app locally, you can run the following command:

```npm run local```

After starting the local server, you should setup all the needed data for the project:

- Call the endpoint `v2/private/insert-test-data` so that the test data is inserted in the database.
- Call the endpoint `setup-stock` so that the stock bucket is setup locally.



## Architecture

### The architecture of this repo follows the BCE architectural pattern:

- Boundaries: API endpoints responsible for receiving and responding to client HTTP events.
- Controllers: Modules responsible for processing the business logic behind the repo.
- Entities: Shared type definitions that support the repo's type safety.

### Additional layers added:

- Adapters: HTTP clients for external services, including the DB, KV namespaces and additional services that interact with the program.
- Utils: Utility functions that help reduce the complexity of code throughout the repo.

