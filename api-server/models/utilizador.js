var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    nome: { type:  String, required: true },
    email: { type: String, required: true , unique: true},
    filiacao: String,
    nivel: String,
    dataRegisto: String,
    dataUltimoAcesso: String,
    password: { type: String, required: true },
})

module.exports = mongoose.model('utilizador', userSchema)