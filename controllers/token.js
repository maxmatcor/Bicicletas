var usuario = require("../models/usuario");
var token = require("../models/token");

module.exports = {
  confirmationGet: function (req, res, next) {
    token.findOne({ token: req.params.token }, function (err, token) {
      if (!token)
        return res
          .status(400)
          .send({ type: "not-verified", msg: "No existe usuario" });
      usuario.findById(token._userId, function (err, usuario) {
        if (!usuario)
          return res.status(400).send({ msg: "No se encontro a ese usuario" });
        if (usuario.verficado) return res.redirect("/usuarios");
        usuario.verficado = true;
        usuario.save(function (err) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
          res.redirect("/");
        });
      });
    });
  },
};
