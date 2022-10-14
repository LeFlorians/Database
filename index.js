const express = require("express")
const path = require("path")

const PORT = 8080;

// create express instance
const app = express()

// initialize the database, create tables
const db = require("./src/database")()

// initialize body parser
app.use(express.json());

// serve static js
app.use(express.static("src/static/js"))

// setup express-session
const session = require("express-session")
app.use(session({
    secret: 'fuck amazon lol',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // enable when using HTTPS
  }))

// setup handler
require("./src/handler")(app, db)

// serve html files
sendFile = (res, file) => {res.sendFile(file, {root: path.join(__dirname, "src/static")})}
app.get("/style.css", (req,res) => sendFile(res, "style.css"))
app.get('/', (req, res) => { 
  if(req.session)
    console.log("user session: " + JSON.stringify(req.session))
  if(req.session && typeof(req.session.user_id) == "number")
    sendFile(res, "store.html")
  else
    sendFile(res, "index.html")
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})