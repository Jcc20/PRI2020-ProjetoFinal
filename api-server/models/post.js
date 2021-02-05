var mongoose = require('mongoose')

var postSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type : String, required: true },
    dataRegisto: { type : Date, default: Date.now, required: true },
    autor: {
        nomeA :  { type : String, required: true },
        emailA : { type : String, required: true }
         },
    rec:{
        idRec: { type : mongoose.ObjectId, required: true},
        titRec: {type : String, required: true}
    },
    comentarios: [{
        emailC   :  { type :  String, required: true},
        nomeC : { type :  String, required: true},
        dataC : { type : Date, default: Date.now, required: true },
        comentario: String
        }]
})

module.exports = mongoose.model('post', postSchema)