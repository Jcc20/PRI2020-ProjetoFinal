// Controlador para o modelo Recurso

var Recurso = require('../models/recurso')
var limit=4

// Devolve a lista de recursos
module.exports.listar = (page) => {
    return Recurso
        .find()
        .skip((page * limit) - limit)
        .limit(limit)
        .exec()
}

module.exports.contarTodos = () => {
    return Recurso
        .countDocuments()
        .exec()
}


module.exports.listarbyTipo = (page) => {
    return Recurso
        .find()
        .sort('tipo')
        .skip((page * limit) - limit)
        .limit(limit)
        .exec()
}

module.exports.listarbyTitulo = (page) => {
    return Recurso
        .find()
        .sort('titulo')
        .skip((page * limit) - limit)
        .limit(limit)
        .exec()
}
module.exports.listarbyData = (page) => {
    return Recurso
        .find()
        .sort({'dataCriacao' : 'desc'})
        .skip((page * limit) - limit)
        .limit(limit)
        .exec()
}
module.exports.listarbyAutor = (page) => {
    return Recurso
        .find()
        .sort({'produtor.nomeP' : 'asc'})
        .skip((page * limit) - limit)
        .limit(limit)
        .exec()
}


module.exports.consultar = id => {
    return Recurso
        .findOne({_id: id})
        .exec()
}

module.exports.inserir = t => {
    var novo = new Recurso(t)
    return novo.save()
}

module.exports.remover = function(id){
    return Recurso.deleteOne({_id: id})
}

module.exports.alterar = function(t){
    return Recurso.findByIdAndUpdate({_id: t._id}, t, {new: true})
}
