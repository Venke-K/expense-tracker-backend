import User from '../Models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword, 
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            token,
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "5min",
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};