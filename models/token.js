const mongoose = require("mongoose");
const { token } = require("morgan");
const { schema } = require("./bicicleta");
const Schema = mongoose.Schema;
const TokenSchema = new Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "Usuario",
  },
  token: { type: String, required: true },
  createAt: { type: Date, required: true, default: Date.now, expires: 43200 },
});
module.exports = mongoose.model("Token", TokenSchema);
