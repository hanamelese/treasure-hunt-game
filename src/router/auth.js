const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("../db/models/userSchema");
const Result = require("../db/models/resultSchema");

const router = express.Router();

// Session middleware
router.use(session({
    secret: 'your-secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: false
}));

// Middleware to protect routes
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/index.html");
    }
    next();
};

// Routes
router.get("/", (req, res) => {
    res.render("index");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/instructions", requireAuth, (req, res) => {
    res.render("instructions");
});

router.get("/game", requireAuth, (req, res) => {
    res.render("game");
});

router.get("/score", requireAuth, (req, res) => {
    res.render("score");
});

router.get("/clues", requireAuth, (req, res) => {
    res.render("clues");
});

router.get("/result", requireAuth, async (req, res) => {
    try {
        const users = await Result.find({}).sort({ score: -1 });
        res.render("result", { usersList: users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.get("/table", requireAuth, async (req, res) => {
    try {
        const users = await User.find({});
        res.render("table", { usersList: users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.post("/auth", async (req, res) => {
    const { email, password } = req.body;
    const type = req.query.type; // 'login' or 'signup'

    if (!email || !password) {
        return res.status(422).json({ success: false, message: "Please fill all fields!" });
    }

    try {
        if (type === "login") {
            // Login: Check if user exists and password matches
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ success: false, message: "Incorrect password" });
            }
            req.session.userId = user._id.toString();
            req.session.email = user.email;
            return res.json({ success: true, userId: user._id });
        } else {
            // Signup: Check if user exists, create if not
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ success: false, message: "Email already registered" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = new User({ email, password: hashedPassword });
            await userData.save();
            req.session.userId = userData._id.toString();
            req.session.email = userData.email;
            return res.json({ success: true, userId: userData._id });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.post("/score", requireAuth, async (req, res) => {
    const { name, score } = req.body;
    if (!name || !score) {
        return res.status(422).json({ error: "Please fill all fields!" });
    }
    try {
        const scoreData = new Result({
            name,
            score,
            userId: req.session.userId
        });
        await scoreData.save();
        res.status(201).render("score");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;