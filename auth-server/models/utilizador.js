var mongoose = require('mongoose')

var utilizadorSchema = new mongoose.Schema({
    nome: { type:  String, required: true },
    email: { type: String, required: true , unique: true},
    password: { type: String, required: true },
    filiacao: String,
    nivel: { type:  String, default: "consumer", required: true },
    dataRegisto: { type : Date, default: Date.now, required: true },
    dataUltimoAcesso: { type : Date }
})

module.exports = mongoose.model('utilizador', utilizadorSchema)