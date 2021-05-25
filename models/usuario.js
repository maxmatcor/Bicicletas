var mongoose = require("mongoose");
var Reserva = require("./reserva");
var Token = require("./token");
var Schema = mongoose.Schema;

const bcrypt = require("bcrypt");
var crypto = require("crypto");
var mailer = require("../mailer/mailer");

const mongooseUniqueValidator = require("mongoose-unique-validator");
const { defaultMaxListeners } = require("stream");
const saltRounds = 10;

const validateEmail = (email) => {
  const re = /^\w+([\.~]?\w+)*@\w+([\.~]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

var usuarioSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "El nombre es obligatorio"],
  },
  email: {
    type: String,
    trim: true,
    required: [true, "El email es obligatorio"],
    lowercase: true,
    unique: true,
    validate: [validateEmail, "Por favor ingrese un email valido"],
    match: /^\w+([\.~]?\w+)*@\w+([\.~]?\w+)*(\.\w{2,3})+$/,
  },
  password: {
    type: String,
    required: [true, "El password es obligatorio"],
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  validated: {
    type: Boolean,
    required: true,
    default: false,
  },
  facebookId: {
    type: String,
  },
  googleId: {
    type: String,
  },
});

usuarioSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
  }
  next();
});

usuarioSchema.plugin(mongooseUniqueValidator, {
  message: "El {PATH} ya existe con otro usuario",
});

usuarioSchema.methods.resetpassword = function (cb) {
  const token = new Token({
    _userId: this.id,
    token: crypto.randomBytes(16).toString("hex"),
  });

  const emailDestination = this.email;

  token.save((err) => {
    if (err) {
      return cb(err);
    }

    const mailOptions = {
      from: "no-reply@redBicicletas.com",
      to: emailDestination,
      subject: "Reseteo de password de cuenta",
      text:
        "Hola, \n\n" +
        "Por favor, para resetear el password de su cuenta haga click en este link: \n\n" +
        "http://localhost:5000" +
        "/resetPassword/" +
        token.token +
        ". \n",
    };

    mailer.sendMail(mailOptions, (err) => {
      if (err) return cb(err);
      console.log(
        "Se envio un email para resetear el password a: ",
        emailDestination
      );
    });

    cb(null);
  });
};

usuarioSchema.statics.findOneOrCreateByGoogle = function findOneOrCreateByGoogle(
  condition,
  callback
) {
  const self = this;
  console.log("condition", condition);
  self.findOne(
    {
      $or: [{ googleId: condition.id }, { email: condition.emails[0].value }],
    },
    (err, result) => {
      if (result) {
        callback(err, result);
      } else {
        console.log("--------- Condition ------------");
        console.log("condition", condition);
        let values = {};
        values.googleId = condition.id;
        values.email = condition.emails[0].value;
        values.name = condition.displayName || "Sin nombre";
        values.validated = true;
        values.password = 123;
        console.log("--------- Values --------------");
        console.log("values", values);
        self.create(values, (err, result) => {
          if (err) {
            console.log("err", err);
          }
          return callback(err, result);
        });
      }
    }
  );
};

usuarioSchema.statics.findOneOrCreateByFacebook = function findOneOrCreateByFacebook(
  condition,
  callback
) {
  const self = this;
  console.log("condition", condition);
  self.findOne(
    {
      $or: [{ facebookId: condition.id }, { email: condition.emails[0].value }],
    },
    (err, result) => {
      if (result) {
        callback(err, result);
      } else {
        console.log("--------- Condition ------------");
        console.log("condition", condition);
        let values = {};
        values.facebookId = condition.id;
        values.email = condition.emails[0].value;
        values.name = condition.displayName || "Sin nombre";
        values.validated = true;
        values.password = crypto.randomBytes(16).toString("hex");
        console.log("--------- Values --------------");
        console.log("values", values);
        self.create(values, (err, result) => {
          if (err) {
            console.log("err", err);
          }
          return callback(err, result);
        });
      }
    }
  );
};

usuarioSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

usuarioSchema.methods.sendWelcomeEmail = function (cb) {
  const token = new Token({
    _userId: this.id,
    token: crypto.randomBytes(16).toString("hex"),
  });
  const emailDestination = this.email;
  token.save((err) => {
    if (err) {
      return console.log("err.message", err.message);
    }

    const mailOptions = {
      from: "no-reply@redBicicletas.com",
      to: emailDestination,
      subject: "Verificacion de cuenta",
      text:
        "Hola \n\n" +
        "Por favor para verificar su cuenta haga click en el siguiente enlace: \n" +
        "http://localhost:5000" +
        "/token/confirmation/" +
        token.token +
        "\n",
    };

    mailer.sendMail(mailOptions, (err) => {
      if (err) {
        return console.log("err", err);
      }
      console.log("Email sended to ", emailDestination);
    });
  });
};

usuarioSchema.statics.createInstance = function (name) {
  return {
    name,
  };
};

usuarioSchema.statics.allUsers = function (cb) {
  return this.find({}, cb);
};

usuarioSchema.statics.add = function (usuario, cb) {
  this.create(usuario, cb);
};

usuarioSchema.statics.removeByName = function (name, cb) {
  return this.deleteOne({ name }, cb);
};

usuarioSchema.statics.findByName = function (name, cb) {
  return this.findOne({ name }, cb);
};

usuarioSchema.statics.reservar = function (
  userId,
  biciId,
  fechaInicial,
  fechaFinal,
  cb
) {
  var reserva = new Reserva({
    usuario: userId,
    bicicleta: biciId,
    fechaInicial,
    fechaFinal,
  });
  // console.log("reserva", reserva);
  reserva.save(reserva, cb);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
