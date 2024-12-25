import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Signup controller
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName) 
        return res.status(400).json({ error: true, message: "Full Name is required" });
    if (!email) 
        return res.status(400).json({ error: true, message: "Email is required" });
    if (!password) 
        return res.status(400).json({ error: true, message: "Password is required" });

    try {
        const isUser = await User.findOne({ email });
        if (isUser) 
            return res.status(400).json({ error: true, message: "User already exists" });

        const user = new User({
            name:fullName,
            email,
            password,
        });
        await user.save();

        // Generate access token
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d",
        });

        return res.status(201).json({
            error: false,
            message: "Registration successful",
            accessToken,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};


// Login controller
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) 
        return res.status(400).json({ message: "Email is required" });
    if (!password) 
        return res.status(400).json({ message: "Password is required" });

    try {
        const user = await User.findOne({ email });
        if (!user) 
            return res.status(400).json({ message: "Invalid email or password" });

        if (user.password === password) {
            // Generate access token
            const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d",
            });

            return res.status(200).json({
                error: false,
                message: "Login successful",
                accessToken,
            });
        } else {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};