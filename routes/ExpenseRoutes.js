import express from "express";
import Expense from '../Models/ExpenseModal.js';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id; // Add user ID to request
    next();
  });
};

// Add expense
router.post("/add", authenticate, async (req, res) => {
    console.log("Received Body:", req.body);
  const { amount, category, description,date } = req.body;

  if (!amount || !category || !description || !date) {
    return res.status(400).json({ message: "All fields are required" });
  }


  try {
    const newExpense = new Expense({
      user: req.userId,
      amount,
      category,
      description,
      date: new Date(date)
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: "Error adding expense", error: error.message });
  }
});

// Get all expenses for a user
router.get("/all", authenticate, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
});


// Update expense
router.put("/update/:id", authenticate, async (req, res) => {
    try {
      const expense = await Expense.findById(req.params.id);
  
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
  
      if (expense.user.toString() !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
  
      const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true }     
      );
  
      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Error updating expense", error: error.message });
    }
  });


  // Delete expense
router.delete("/delete/:id", authenticate, async (req, res) => {
    try {
      const expense = await Expense.findById(req.params.id);
  
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
  
      if (expense.user.toString() !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
  
      await Expense.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting expense", error: error.message });
    }
  });


  router.get("/total/monthly", authenticate, async (req, res) => {
    try {
        // Convert userId to ObjectId
        const userId = new mongoose.Types.ObjectId(req.userId.toString());

        // Define start and end of the month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

        console.log("Start of Month:", startOfMonth);
        console.log("End of Month:", endOfMonth);
        console.log("User ID:", userId);

        // Check if expenses exist before aggregation
        const userExpenses = await Expense.find({ user: userId });
        console.log("User Expenses Before Aggregation:", userExpenses);

        // Run aggregation with ObjectId conversion
        const total = await Expense.aggregate([
            { 
                $match: { 
                    user: userId,  // Convert userId to ObjectId
                    date: { $gte: startOfMonth, $lte: endOfMonth } 
                } 
            },
            { 
                $group: { _id: null, totalAmount: { $sum: "$amount" } } 
            }
        ]);

        console.log("Total Expenses Aggregation Result:", total);

        res.json({ totalAmount: total[0]?.totalAmount || 0 });
    } catch (error) {
        console.error("Error fetching total expenses:", error);
        res.status(500).json({ error: "Error fetching total expenses" });
    }
});


// Get all expenses with optional filters
router.get("/filtered", authenticate, async (req, res) => {
  try {
      const { startDate, endDate } = req.query;
      console.log("Received Query Params:", { startDate, endDate });

      const userId = new mongoose.Types.ObjectId(req.userId);

      let query = { user: userId };

      // Apply date filter if both dates exist
      if (startDate && endDate) {
        const start = new Date(new Date(startDate).setHours(0, 0, 0, 0)); // Start of the day
        const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)); 

          console.log("Filtering between:", start, "and", end);

          query.date = { $gte: start, $lte: end };
      }

      console.log("MongoDB Query:", JSON.stringify(query, null, 2));

      const expenses = await Expense.find(query).sort({ date: -1 });
      console.log(`Filtered Expenses Returned: ${expenses.length}`);

      res.status(200).json(expenses);
  } catch (error) {
      console.error("Error fetching filtered expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses." });
  }
});




export default router;
