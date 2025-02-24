import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'
import connectDB from './Config/db.js';
import authRoutes from './routes/authRoutes.js';
import ExpenseRoutes from './routes/ExpenseRoutes.js'





dotenv.config()
connectDB();


const app = express()

app.use(express.json());
app.use(cors());





app.use("/api/auth", authRoutes);
app.use("/api/expenses", ExpenseRoutes);



const PORT = process.env.PORT ||  5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
});