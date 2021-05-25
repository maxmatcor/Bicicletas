var mongoose = require("mongoose");
var Bicicleta = require("../../models/bicicleta");
var Usuario = require("../../models/usuario");
var Reserva = require("../../models/reserva");

describe("Testing Usuario", function () {
  beforeEach(function (done) {
    mongoose.disconnect();
    var mongoDB = "mongodb://localhost:testdb";
    mongoose.connect(mongoDB, { useNewUrlParser: true });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", function () {
      console.log("We are connected to test database");
      done();
    });
  });

  afterEach(function (done) {
    Reserva.deleteMany({}, function (err, success) {
      if (err) console.log(err);
      Usuario.deleteMany({}, function (err, success) {
        if (err) console.log(err);
        Bicicleta.deleteMany({}, function (err, success) {
          if (err) console.log(err);
          done();
        });
      });
    });
  });

  describe("Un usuario reserva una Bici", () => {
    it("debe existir la reserva", (done) => {
      const usuario = new Usuario({ nombre: "Ezequiel" });
      usuario.save();
      const bicicleta = new Bicicleta({
        code: 1,
        color: "verde",
        modelo: "urbana",
      });
      bicicleta.save();

      var hoy = new Date();
      var mañana = new Date();
      mañana.setDate(hoy.getDate() + 1);
      usuario.reservar(bicicleta.id, hoy, mañana, function (err, reserva) {
        Reserva.find({})
          .populate("bicicleta")
          .populate("usuario")
          .exec(function (err, reserva) {
            console.log(reserva[0]);
            expect(reserva.length).toBe(1);
            expect(reserva[0].diaDeReserva()).toBe(2);
            expect(reserva[0].bicicleta.code).toBe(1);
            expect(reserva[0].usuario.nombre).toBe(usuario.nombre);
            done();
          });
      });
    });
  });
});
