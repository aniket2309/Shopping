# Shopping# Simple Shopping Portal Project

This project is a simple shopping portal built with Node.js and Express, featuring a RESTful API for managing tasks. Each task in the system includes a title, description, status, and timestamps for creation and last update. MongoDB is used for data storage.

## Requirements

- Implement endpoints for adding, fetching, updating, and deleting tasks.
- Use MongoDB for data storage.
- Ensure input validation and error handling are in place.
- Write concise documentation for API endpoints.

## Installation and Setup

1. **Install Dependencies**: Run the following command to install project dependencies:

    ```bash
    npm install
    ```

2. **Run the Application**: Start the server using the following command:

    ```bash
    npx nodemon
    ```

    This will run the code and automatically create the necessary database structure.

## API Documentation

The API documentation is provided using Swagger UI. Once the server is running, you can access the API documentation at `http://localhost:3000/api-docs`.

## API Endpoints

The following endpoints are available:

- **GET /tasks**: Fetch all tasks.
- **GET /tasks/{taskId}**: Fetch a specific task by ID.
- **POST /tasks**: Create a new task.
- **PUT /tasks/{taskId}**: Update a task by ID.
- **DELETE /tasks/{taskId}**: Delete a task by ID.

For detailed information on request and response parameters, refer to the API documentation.

## Folder Structure

The project has the following folder structure:

