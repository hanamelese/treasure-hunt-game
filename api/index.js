// api/index.js
const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
require("dotenv").config({
  path: path.resolve(__dirname, "../config.env")
});

// 1. Connect to MongoDB
mongoose.set("strictQuery", true);
console.log("🛠  DATABASE env is:", process.env.DATABASE);
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB Error:", err));

// 2. Set up Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// 3. Static + view engine
const staticPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.use(express.static(staticPath));
app.set("view engine", "ejs");
app.set("views", viewsPath);
require("hbs").registerPartials(partialsPath);

// 4. Routers & routes
app.use(require("../src/router/auth"));
app.get("/", (req, res) => res.send("Home Page"));

// 5. Export the app for Vercel
module.exports = app;