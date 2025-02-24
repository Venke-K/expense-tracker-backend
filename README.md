💰 Expense Tracker - Backend

A robust backend for the Expense Tracker application, built with Node.js, Express.js, and MongoDB. It handles user authentication, 
expense management, and secure data storage.

🚀 Features

    🔒 User Authentication (JWT-based)
    💵 CRUD operations for expenses
    📊 RESTful API endpoints
    🛡️ Secure password hashing with bcrypt
    🌐 CORS-enabled for frontend integration

   ⚡ Tech Stack

    Node.js
    Express.js
    MongoDB Atlas
    Mongoose
    JWT (JSON Web Tokens)
    bcryptjs
    dotenv


🌐 API Endpoints

    Auth Routes:
        POST /api/auth/register – Register new user
        POST /api/auth/login – Login user and return JWT
    Expense Routes:
        GET /api/expenses – Get all expenses for user
        POST /api/expenses – Add new expense
        PUT /api/expenses/:id – Update expense
        DELETE /api/expenses/:id – Delete expense

  📄 License

This project is licensed under the MIT License.      
