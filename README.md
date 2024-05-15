# Task Manager API 

This application is built using Node.js and TypeScript, leveraging Zod for validation purposes.

## Installation

1. **Node.js and TypeScript Installation:**  
    - Ensure that you have Node.js installed on your local machine. If you haven't installed TypeScript globally, you can do so by running the following command:
       ```bash
       npm install -g typescript

2. **Environmental Variable Setup:**  
    - Copy the environmental variables from `.env.example` to a new `.env` file  by running the following command:
       ```bash
       cp .env.example .env
   - Replace the placeholder values with your PostgreSQL connection string in `DATABASE_URL` and set your JWT secret in `JWT_SECRET`.

3. **Dependency Installation:**  
   - Run the following command to install the required dependencies:
      ```bash
      npm install

4. **Build and run it locally**  
     ```bash
      npx tsc -b; node build/index.js
     
5. **Access it on**  
     ```bash
      http://localhost:3000 
