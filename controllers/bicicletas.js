var Bicicleta = require("../models/bicicleta");

exports.bicicleta_list = function (req, res) {
  Bicicleta.allBicis(function (error, result) {
    res.render("bicicletas/index", { bicis: result });
  });
};

exports.bicicleta_create_get = function (req, res) {
  res.render("bicicletas/create");
};

exports.bicicleta_create_post = function (req, res) {
  var bici = new Bicicleta({
    code: req.body.id,
    color: req.body.color,
    modelo: req.body.modelo,
    ubicacion: [req.body.latitud, req.body.longitud],
  });
  Bicicleta.add(bici, function (error, newElement) {
    res.redirect("/bicicletas");
  });
};

exports.bicicleta_update_get = function (req, res) {
  var bici = Bicicleta.findById(req.params.code);
  res.render("bicicletas/update", { bici });
};

exports.bicicleta_update_post = function (req, res) {
  var bici = Bicicleta.findById(req.params.code);
  bici.id = req.body.code;
  bici.color = req.body.color;
  bici.modelo = req.body.modelo;
  bici.ubicacion = [req.body.latitud, req.body.longitud];

  res.redirect("/bicicletas");
};

exports.bicicleta_delete_post = function (req, res) {
  Bicicleta.removeById(req.body.code);
  res.redirect("/bicicletas");
};
