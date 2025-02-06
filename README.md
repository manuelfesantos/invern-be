# Invern Spirit Backend

## Get Started

To startup on this repo after cloning it, run the following command:

```npm run init```

This installs all dependencies, starts up husky and builds the local database.

### Setting up the environment variables
An example of the environment variables needed for the project can be found in the `.env.example` file. You can create a `.dev.vars` file in the root of the project and copy the contents of the `.env.example` file into it. You can then replace the values with the appropriate values, following the instructions in the `.env.example` file.

## Running the app

To run the app locally, you can run the following command:

```npm run local```

After starting the local server, you should setup all the needed data for the project:

- Make a GET request to the endpoint `private/insert-test-data` so that the test data is inserted in the database.
- Make a POST request to the endpoint `private/stock/setup` so that the stock bucket is setup locally. Make sure to add the secretKey in the request body with the `SETUP_STOCK_SECRET` value from your `.dev.vars` file.



