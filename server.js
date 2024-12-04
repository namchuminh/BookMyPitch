const express = require("express");
const session = require('express-session');
const app = express();


// Connect to database
const sequelize = require('./app/config/db.config.js');

// Test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection DATABASE successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/app/views');


app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

// Định nghĩa middleware để thêm base URL vào mỗi request
app.use((req, res, next) => {
  req.base_url = "http://127.0.0.1:3001/";
  next();
});


app.use(session({
  secret: 'THEDUNG', // Key bí mật để ký và mã hóa session ID
  resave: false,
  saveUninitialized: false
}));

// Middleware để gắn session vào biến toàn cục
app.use((req, res, next) => {
  res.locals.customer = req.session.customer; // Gắn session vào biến toàn cục locals
  res.locals.admin = req.session.admin;
  next();
});



//Import route application
const route = require("./app/routes/index.js")
// Routes
route(app)

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));