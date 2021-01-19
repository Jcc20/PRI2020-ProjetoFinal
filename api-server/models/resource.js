var mongoose = require('mongoose')

var resourceSchema = new mongoose.Schema({
	_id: String,
    tipo: { type: String, required: true },
    titulo: { type: String, required: true },
    subtitulo: String,
    dataCriacao: String,
    dataRegisto: { type: String, required: true },
    visibilidade: { type: String, required: true },
    produtor: { type: String, required: true }
})

module.exports = mongoose.model('resource', resourceSchema)