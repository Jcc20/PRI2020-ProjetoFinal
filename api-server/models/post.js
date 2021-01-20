var mongoose = require('mongoose')

var postSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type : String, required: true },
    dataRegisto: { type : Date, default: Date.now, required: true },
    autor: {
        nomeA :  { type : String, required: true },
        emailA : { type : String, required: true }
         },
    comentarios: [{
        nomeC : String,
        dataC : Date,
        comentario: String
         }]
})

module.exports = mongoose.model('post', postSchema)