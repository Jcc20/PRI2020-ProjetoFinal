// Controlador para o modelo Utilizador

var Utilizador = require('../models/utilizador')

// Devolve a lista de Utilizadores
module.exports.listar = () => {
    return Utilizador
        .find()
        .exec()
}


module.exports.consultar = id => {
    return Utilizador
        .findOne({_id: id})
        .exec()
}


module.exports.consultarByEmail = mail => {
    return Utilizador
        .findOne({email: mail})
        .exec()
}


module.exports.inserir = t => {
    var novo = new Utilizador(t)
    return novo.save()
}

module.exports.remover = function(id){
    return Utilizador.deleteOne({_id: id})
}

module.exports.alterar = function(t){
    return Utilizador.findByIdAndUpdate({_id: t._id}, t, {new: true})
}
