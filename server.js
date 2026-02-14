/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const cookieParser = require("cookie-parser")
const env = require("dotenv").config()
const app = express()
const bodyParser = require("body-parser")
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")
const errorController = require("./controllers/errorController")
const http = require("http")
const port = process.env.PORT || 3000

// Adding Database and Session Storage
const session = require("express-session")
const pool = require('./database/')
const flash = require("connect-flash")
const messages = require("express-messages")


/* ***********************
 * Routes
 *************************/
app.use(static)


/* ***********************
 * Middleware
 * ************************/
app.use(cookieParser())
app.use(utilities.checkJWTToken)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account Route
app.use("/account", accountRoute)

app.get("/cause-error", utilities.handleErrors(errorController.triggerError))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = []
  try {
    nav = await utilities.getNav()
    console.error(`Error at: "${req.originalUrl}": ${err.message}`)
    if(err.status == 404){ message = err.message} else {message = err.message || 'Oh no! There was a crash. Maybe try a different route?'}
    res.render("errors/error", {
      title: err.status || 'Server Error',
      message,
      nav
    })

  } catch (err) {
    console.error("Nav load failed:", err.message);
  }
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/

// const server = http.createServer(app)

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})
