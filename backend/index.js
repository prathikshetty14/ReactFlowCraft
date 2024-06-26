//Require necessary packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require('cors');



//Require Routes
const authRoute = require("./routes/auth");
const graphRoute = require('./routes/graphRoutes');
const executionRoute = require('./routes/execution');

const User = require('./models/User')

const app = express();

app.use(express.json());

app.use(cors());

//Setup view engine EJS, use body-parser and express static
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));


//Setup session
app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false
}));


//Initialize passport
app.use(passport.initialize());

//Use passport to deal with session
app.use(passport.session());


//Connect To Database
mongoose.connect(process.env.DB_CONNECT)
  .then(() => console.log("Database Connected"))
  .catch(err => console.log(err));


//Use Application Routes
app.use("/", authRoute);
app.use('/api/graphs', graphRoute);
app.use('/api/execute', executionRoute);

//Run the Server
app.listen(process.env.PORT, () => console.log("Server Running"));
