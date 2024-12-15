# Writing the README file based on the user's requirements

This is the backend of the **Comaint** application.
__Comaint Backend__ is built with **Node.js** and **Express.js**. 
It provides a RESTful API.

## Features

- REST API built with **Express.js**
- Documentation:
  - Markdown format available at `documentation/api`
  - [API Documentation](https://comaint.powimod.com/api-docs/#/)
  - Swagger JSON: [swagger.json](https://comaint.powimod.com/swagger.json)
- Configurable with `.env` files
- Mocha/Chai testing suite

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 23 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/powimod/comaints
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `env.template` file to `.env`.
   - Edit the `.env` file to configure your environment-specific settings.

# Running the Server

- For production:
   ```bash
   npm run start
   ```

- For development (with **nodemon**):
   ```bash
   npm run dev
   ```

# Running Tests

Run the test suite using **Mocha** and **Chai**:
   ```bash
   npm run test
   ```

# API Documentation

- Interactive API documentation is available at: [https://comaint.powimod.com/api-docs/#/](https://comaint.powimod.com/api-docs/#/)
- The Swagger JSON definition can be downloaded from: [swagger.json](https://comaint.powimod.com/swagger.json)

# Directory Structure

- `documentation/api/`: Contains API documentation in Markdown format.
- `src/`: Source code of the backend.
- `tests/`: Test files.

# License

 [GPL V3](../LICENSE)

