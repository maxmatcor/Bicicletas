var mongoose = require("mongoose");
var Bicicleta = require("../../models/bicicleta");

describe("Testing Bicicletas", () => {
  beforeAll((done) => {
    mongoose.connection.close(done);
  });
  beforeEach(function (done) {
    mongoose.disconnect();
    var mongoDB = "mongodb://localhost:testdb";
    mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", function () {
      console.log("We are connected to test database");
      done();
    });
  });

  afterEach(function (done) {
    Bicicleta.deleteMany({}, function (err, success) {
      if (err) console.log(err);
      done();
    });
  });

  describe("Bicicleta.createInstance", () => {
    it("crea una instancia de Bicicleta", () => {
      var bici = Bicicleta.createInstance(1, "verde", "urbana", [-34.5, -54.1]);

      expect(bici.code).toBe(1);
      expect(bici.color).toBe("verde");
      expect(bici.modelo).toBe("urbana");
      expect(bici.ubicacion[0]).toEqual(-34.5);
      expect(bici.ubicacion[1]).toEqual(-54.1);
    });
  });

  describe("Bicicleta.allBicis", () => {
    it("comienza vacia", (done) => {
      Bicicleta.allBicis(function (err, bicis) {
        expect(bicis.length).toBe(0);
        done();
      });
    });
  });

  describe("Bicicleta.add", () => {
    it("agrega solo una bici", (done) => {
      var aBici = new Bicicleta({ code: 1, color: "verde", modelo: "urbana" });
      Bicicleta.add(aBici, function (err, success) {
        if (err) console.log(err);
        Bicicleta.allBicis(function (err, bicis) {
          expect(bicis.length).toBe(1);
          expect(bicis[0].code).toBe(1);
          done();
        });
      });
    });
  });

  describe("Bicicleta.findByCode", () => {
    it("devuelve bici con code 1", (done) => {
      Bicicleta.allBicis(function (err, bicis) {
        expect(bicis.length).toBe(0);

        var aBici = new Bicicleta({
          code: 1,
          color: "verde",
          modelo: "urbana",
        });
        Bicicleta.add(aBici, function (err, newBici) {
          if (err) console.log(err);

          var aBici2 = new Bicicleta({
            code: 2,
            color: "rojo",
            modelo: "urbana",
          });
          Bicicleta.add(aBici2, function (err, newBici) {
            if (err) console.log(err);
            Bicicleta.findByCode(1, function (err, targetBicis) {
              expect(targetBicis.code).toBe(aBici.code);
              expect(targetBicis.color).toBe(aBici.color);
              expect(targetBicis.modelo).toBe(aBici.modelo);
              done();
            });
          });
        });
      });
    });
  });
});

// beforeEach(() => {
//   Bicicleta.allBicis = [];
// });
// describe("Bicicleta.allBicis", () => {
//   it("comienza vacia", () => {
//     expect(Bicicleta.allBicis.length).toBe(0);
//   });
// });

// describe("Bicicleta.add", () => {
//   it("Agregamos una", () => {
//     expect(Bicicleta.allBicis.length).toBe(0);
//     var a = new Bicicleta(1, "roja", "urbana", [-32.9566893, -60.6466107]);
//     Bicicleta.add(a);
//     expect(Bicicleta.allBicis.length).toBe(1);
//   });
// });

// describe("Bicicleta.findByID", () => {
//   it("debe devolver la bici id 1", () => {
//     expect(Bicicleta.allBicis.length).toBe(0);
//     var aBici = new Bicicleta(1, "verde", "urbana");
//     var aBici2 = new Bicicleta(2, "roja", "urbana");
//     Bicicleta.add(aBici);
//     Bicicleta.add(aBici2);

//     var targetBici = Bicicleta.findById(1);
//     expect(targetBici.id).toBe(1);
//     expect(targetBici.color).toBe(aBici.color);
//     expect(targetBici.modelo).toBe(aBici.modelo);
//   });
// });
