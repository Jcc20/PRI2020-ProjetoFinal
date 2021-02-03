// Controlador para o modelo Recurso

var Recurso = require('../models/recurso')


// Devolve a lista de recursos
module.exports.listarAll = (page, lim) => {
    return Recurso
        .find()
        .skip((page * lim) - lim)
        .limit(lim)
        .exec()
}

module.exports.listar = (page, lim, email) => {
    return Recurso
        .find( { $or: [ { 'produtor.emailP': email }, { visibilidade: true } ] } )   
        .skip((page * lim) - lim)
        .limit(lim)
        .exec()
}

module.exports.contarTodos = () => {
    return Recurso
        .countDocuments()
        .exec()
}


module.exports.listarbyTipo = (page, lim) => {
    return Recurso
        .find()
        .sort('tipo')
        .skip((page * lim) - lim)
        .limit(lim)
        .exec()
}

module.exports.listarbyTitulo = (page, lim) => {
    return Recurso
        .find()
        .sort('titulo')
        .skip((page * lim) - lim)
        .limit(lim)
        .exec()
}

module.exports.listarbyData = (page, lim) => {
    return Recurso
        .find()
        .sort({'dataCriacao' : 'desc'})
        .skip((page * lim) - lim)
        .limit(lim)
        .exec()
}

module.exports.listarbyDataRegisto = () => {
    return Recurso
        .find()
        .sort({'dataRegisto' : 'desc'})
        .exec()
}

module.exports.listarbyAutor = (page, lim) => {
    return Recurso
        .find()
        .sort({'produtor.nomeP' : 'asc'})
        .skip((page * lim) - lim)
        .limit(lim)
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
