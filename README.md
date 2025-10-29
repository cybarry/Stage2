# Country Currency & Exchange API

This is a RESTful API built with Node.js, Express, and Sequelize. It fetches country and currency data from external sources, caches it in a MySQL database, and provides several endpoints to access that data.

## Features

-   Fetches and caches data from `restcountries.com` and `open.er-api.com`.
-   Calculates an estimated GDP for each country.
-   Provides endpoints to list, get, and delete countries.
-   Supports filtering by region and currency.
-   Supports sorting by GDP.
-   Generates and serves a dynamic summary image.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later)
-   [MySQL](https://www.mysql.com/) server (running)
-   A MySQL database (e.g., `country_db`)

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project. Copy the contents of `.env.example` (if you have one) or use the template below:

    ```ini
    # Server Port
    PORT=8080

    # MySQL Database Connection
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=your_db_user
    DB_PASS=your_db_password
    DB_NAME=country_db
    ```
    **Important:** Make sure the database `country_db` (or your chosen name) already exists on your MySQL server.

## How to Run

1.  **Start the server:**
    ```bash
    npm start
    ```
    (You can also run `node index.js`)

2.  The server will be running at `http://localhost:8080`.

3.  **Initialize the Database:**
    The first time you run the API, the database will be empty. You **must** call the refresh endpoint to populate it:

    `POST http://localhost:8080/countries/refresh`

    You can do this using Postman, Insomnia, or cURL:
    ```bash
    curl -X POST http://localhost:8080/countries/refresh
    ```

## API Endpoints

-   `POST /countries/refresh`
    Fetches data from external APIs, updates the database, and regenerates the summary image.

-   `GET /countries`
    Returns a list of all countries.
    -   **Query Params:**
        -   `?region=Africa` (filters by region, case-insensitive)
        -   `?currency=NGN` (filters by currency code, case-insensitive)
        -   `?sort=gdp_desc` (sorts by GDP descending)

-   `GET /countries/:name`
    Returns a single country by its name (e.g., `/countries/Nigeria`).

-   `DELETE /countries/:name`
    Deletes a single country by its name.

-   `GET /status`
    Returns the total number of countries and the timestamp of the last successful refresh.

-   `GET /countries/image`
    Returns the `summary.png` image. If it doesn't exist, run the `/refresh` endpoint.