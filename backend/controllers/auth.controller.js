import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {errorHandler} from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    const { name, email, password, profileImageUrl, adminJoinCode } = req.body;

    try {

        if (!name || !email || !password || name === "" || email === "" || password === "") {
            return next(errorHandler(400, "All fields are required"));
        }

        const isAlreadyExist = await User.findOne({ email });
        if (isAlreadyExist) {
            return next(errorHandler(400, "User already exists"));
        }

        let role = "user";

        if (adminJoinCode && adminJoinCode === process.env.ADMIN_JOIN_CODE) {
            role = "admin";
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
        });

        await newUser.save();
        return next(errorHandler(201, "User registered successfully"));
    }

    catch (error) {
        console.error("Error in signup controller", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        if(!email || !password || email === "" || password === "") {
            return next(errorHandler(400, "All fields are required"));
        }

        const validUser = await User.findOne({email});
        if(!validUser) {
            return next(errorHandler(404, "User not found"));
        }

        const isPasswordValid = await  bcrypt.compare(password, validUser.password);
        if(!isPasswordValid) {
            return next(errorHandler(401, "Invalid credentials"));
        }

        const token = jwt.sign({ userId: validUser._id, role: validUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        const { password: pass, ...rest } = validUser._doc;

        return res.status(200).cookie("access_token", token, {httpOnly: true}).json({ success: true, message: "User signed in successfully", user: rest });

    }
    catch (error) {
        console.error("Error in sign-in controller", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if(!user) {
            return next(errorHandler(404, "User not found"));
        }
        return res.status(200).json({ success: true, user });
    }
    catch (error) {
        console.error("Error in getUserProfile controller", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, profileImageUrl, email, password } = req.body;
        const updatedData = {};

        if(name) updatedData.name = name;
        if(profileImageUrl) updatedData.profileImageUrl = profileImageUrl;
        if(email) updatedData.email = email;
        if(password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(req.userId, updatedData, { new: true }).select("-password");

        if(!updatedUser) {
            return next(errorHandler(404, "User not found"));
        }

        return res.status(200).json({ success: true, message: "User profile updated successfully", user: updatedUser });
    }
    catch(err) {
        console.error("Error in updateUserProfile controller", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}