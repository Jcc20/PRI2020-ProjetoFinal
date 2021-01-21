// Controlador para o modelo Post

var Post = require('../models/post')

// Devolve a lista de Utilizadores
module.exports.listar = (pag, lim) => {
    return Post
        .find()
        .skip((pag - 1) * lim)
        .limit(lim)
        .exec()
}

module.exports.consultar = id => {
    return Post
        .findOne({_id: id})
        .exec()
}

module.exports.inserir = t => {
    var novo = new Post(t)
    return novo.save()
}

module.exports.remover = function(id){
    return Post.deleteOne({_id: id})
}

module.exports.alterar = function(t){
    return Post.findByIdAndUpdate({_id: t._id}, t, {new: true})
}
