var mongoose = require('mongoose')

var recursoSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    titulo: { type: String, required: true },
    subtitulo: String,
    dataCriacao: { type : Date},
    dataRegisto: { type : Date, default: Date.now, required: true },
    ranking: {
        rating : Number,
        classf : [mongoose.ObjectId]
        },
    visibilidade: { type: Boolean, required: true },
    produtor: {
        nomeP : { type: String, required: true },
        emailP : { type: String, required: true }
         },
    path:{ type: String, required: true}     
})

module.exports = mongoose.model('recurso', recursoSchema)