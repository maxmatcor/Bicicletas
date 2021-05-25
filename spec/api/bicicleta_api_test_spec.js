var Bicicleta = require("../../models/bicicleta");
var request = require("request");
var server = require("../../bin/www");
var base_url = "http://localhost:3000/api/bicicletas";
var mongoose = require("mongoose");

describe("Bicicleta API", () => {
  beforeEach(function (done) {
    mongoose.connection.close().then(() => {
      let mongoDB = "mongodb://localhost:testdb";
      mongoose.connect(mongoDB, { useNewUrlParser: true });

      const db = mongoose.connection;
      db.on("error", console.error.bind(console, "connection error"));
      db.once("open", function () {
        console.log("We are connected to test database");
        done();
      });
    });
  });

  afterEach(function (done) {
    Bicicleta.deleteMany({}, function (err, success) {
      if (err) console.log(err);
      done();
    });
  });
  describe("Post Bicicletas /create", () => {
    it("Status 200", (done) => {
      var headers = { "Content-Type": "application/json" };
      var aBici =
        '{"id":10,"color":"amarillo","modelo":"urbana","latitud":-31.9566893,"longitud":-59.6466107}';

      request.post(
        {
          headers: headers,
          url: base_url + "/create",
          body: aBici,
        },
        function (error, response, body) {
          expect(response.statusCode).toBe(200);
          console.log(bici);
          var bici = JSON.parse(body);
          expect(bici.data.color).toBe("amarillo");
          // expect(bici.ubicacion[0]).toBe(-31.9566893);
          // expect(bici.ubicacion[1]).toBe(-59.6466107);
          done();
        }
      );
    });

    describe("GET Bicicletas /", () => {
      it("Status 200", (done) => {
        request.get(base_url, function (error, response, body) {
          console.log(body);
          console.log(response.statusCode);
          expect(response.statusCode).toBe(200);
          var result = JSON.parse(body);
          expect(result.data.length).toBe(0);
          done();
        });
      });
    });
  });
});
