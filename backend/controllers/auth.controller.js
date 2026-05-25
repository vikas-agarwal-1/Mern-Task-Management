import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const { name, email, password, profileImageUrl, adminJoinCode } = req.body;

    try {

        if (!name || !email || !password || name === "" || email === "" || password === "") {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const isAlreadyExist = await User.findOne({ email });
        if (isAlreadyExist) {
            return res.status(400).json({ success: false, message: "User already exists" });
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
        return res.status(201).json({ success: true, message: "User created successfully" });
    }

    catch (error) {
        console.error("Error in signup controller", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}