var Bicicleta = require("../../models/bicicleta");

exports.bicicleta_list = function (req, res) {
  Bicicleta.allBicis(function (error, result) {
    res.status(200).json({
      data: result,
    });
  });
};

exports.bicicleta_create = function (req, res) {
  let bici = new Bicicleta({
    code: req.body.id,
    color: req.body.color,
    modelo: req.body.modelo,
    ubicacion: [req.body.latitud, req.body.longitud],
  });
  Bicicleta.add(bici, function (error, newElement) {
    res.status(200).json({
      data: newElement,
    });
  });
};

exports.bicicleta_delete = function (req, res) {
  Bicicleta.removeByCode(req.body.code, function (err) {
    res.status(204).send();
  });
};
