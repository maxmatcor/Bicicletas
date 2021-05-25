require("dotenv").config();
require("newrelic");

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("./config/passport");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const jwt = require("jsonwebtoken");

var indexRouter = require("./routes/index");
var usuariosRouter = require("./routes/users");
var tokenRouter = require("./routes/token");
var bicicletasRouter = require("./routes/bicicletas");
var bicicletasAPIRouter = require("./routes/api/bicicletas");
var usuariosAPIRouter = require("./routes/api/usuarios");
var authAPIRouter = require("./routes/api/auth");


const Token = require("./models/token");
var mongoose = require("mongoose");
const usuario = require("./models/usuario");
const { assert } = require("console");
let store;
if (process.env.NODE_ENV ==='development'){
  store = new session.MemoryStore();
}else{
  store= new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection='sessions'
  });
  store.on('error',function(error){
    assert.ifError(error);
    assert.ok(false);
  });
}



var app = express();

app.set("secretKey", "jwt_pwd_11223344");

app.use(
  session({
    cookie: { maxAge: 240 * 60 * 60 * 1000 },
    store: store,
    saveUninitialized: true,
    resave: "true",
    secret: "...",
  })
);

//mongodb+srv://admin:<password>@red-bicicletas.11mzq.mongodb.net/<dbname>?retryWrites=true&w=majority
//var mongoDB = "mongodb://localhost/redBicicletas";
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.get('/auth/google',
  passport.authenticate('google', { scope: [
    'profile'
  ] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', {successRedirect:'/', failureRedirect: '/error' })
  );

app.get("/login", function (req, res) {
  res.render("session/login");
});

app.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, usuario, info) {
    if (err) return next(err);
    if (!usuario) return res.render("session/login", { info });
    req.login(usuario, function (err) {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});

app.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});

app.get("/forgotPassword", function (req, res) {
  res.render("sessions/forgotPassword");
});

app.post("/forgotPassword", function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user)
      return res.render("sessions/forgotPassword", {
        info: { message: "No existe el email para un usuario existente" },
      });

    user.resetPassword(function (err) {
      if (err) return next(err);
      console.log("sessions/forgotPasswordMessage");
    });

    res.render("sessions/forgotPasswordMessage");
  });
});

app.get("/resetPassword/:token", function (req, res, next) {
  console.log(req.params.token);
  token.findOne({ token: req.params.token }, function (err, token) {
    if (!token)
      return res.status(400).send({
        msg:
          "No existe un usuario asociado al token, verifique que su token no haya expirado",
      });
    User.findById(token._userId, function (err, user) {
      if (!user)
        return res
          .status(400)
          .send({ msg: "No existe un usuario asociado al token." });
      res.render("sessions/resetPassword", { errors: {}, user: user });
    });
  });
});

app.post("/resetPassword", function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    res.render("sessions/resetPassword", {
      errors: {
        confirm_password: { message: "No coincide con el password ingresado" },
      },
      user: new User({ email: req.body.email }),
    });
    return;
  }
  User.findOne({ email: req.body.email }, function (err, user) {
    user.password = req.body.password;
    user.save(function (err) {
      if (err) {
        res.render("sessions/resetPassword", {
          errors: err.errors,
          user: new User({ email: req.body.email }),
        });
      } else {
        res.redirect("/login");
      }
    });
  });
});

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    console.log("User sin loguearse");
    res.redirect("/login");
  }
}

function validarUsuario(req, res, next) {
  jwt.verify(req.headers["x-access-token"], req.app.get("secretKey"), function (
    err,
    decoded
  ) {
    if (err) {
      console.log("Error en validar Usuario");
      res.json({ status: "error", message: err.message, data: null });
    } else {
      console.log("Pas� el usuario: " + req.body.userId);
      req.body.userId = decoded.id;
      console.log("JWT verify: " + decoded);
      next();
    }
  });
}
app.use("/", indexRouter);
app.use("/usuarios", usuariosRouter);
app.use("/token", tokenRouter);
app.use("/bicicletas", loggedIn, bicicletasRouter);
app.use("/api/auth", authAPIRouter);
app.use("/api/bicicletas", validarUsuario, bicicletasAPIRouter);
app.use("/api/usuarios", usuariosAPIRouter);

app.use("/privacy_policy", function (req, res) {
  res.sendFile("public/policy_privacy.html");
});

app.use("/google914eea7d78b786f3", function (req, res) {
  res.sendFile("public/google914eea7d78b786f3.html");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
