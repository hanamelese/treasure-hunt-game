const express = require("express");
const session = require("express-session");
// connect-mongo v6 is a dual ESM/CJS package: require() returns the namespace,
// so the store class is a named export rather than the module itself.
const MongoStore = require("connect-mongo").MongoStore;
const bcrypt = require("bcryptjs");
const User = require("../db/models/userSchema");
const Result = require("../db/models/resultSchema");

const router = express.Router();

// Fail loudly at startup rather than mysteriously at request time.
if (!process.env.SESSION_SECRET) {
    throw new Error(
        "SESSION_SECRET is not set. Set it in Vercel \u2192 Settings \u2192 Environment Variables, " +
        "or in config.env for local development."
    );
}
if (!process.env.DATABASE) {
    throw new Error(
        "DATABASE is not set. Set it in Vercel \u2192 Settings \u2192 Environment Variables, " +
        "or in config.env for local development."
    );
}

// Session middleware
// The store is the whole fix: without it express-session uses an in-memory store,
// which on serverless dies with the function instance that created the session.
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE,
        collectionName: "sessions",
        ttl: 14 * 24 * 60 * 60 // seconds
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production", // Vercel sets this; local HTTP still works
        httpOnly: true,
        sameSite: "lax",
        maxAge: 14 * 24 * 60 * 60 * 1000 // milliseconds
    }
}));

// Middleware to protect routes
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/login");
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

router.get("/learnmore", (req, res) => {
    res.render("learnmore");
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
  console.error("🔥 /auth error:", err.stack || err);
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