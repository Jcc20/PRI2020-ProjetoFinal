// Controlador para o modelo Post

var Post = require('../models/post')

// Devolve a lista de Utilizadores
module.exports.listar = () => {
    return Post
        .find()
        .exec()
}

module.exports.consultar = id => {
    return Post
        .findOne({_id: id})
        .exec()
}

module.exports.inserir = t => {
    var novo = new Post(t)
    //var agr = new Date().toLocaleString('pt-PT', { hour12: false});
    //novo.dataRegisto = agr;
    return novo.save()
}

module.exports.remover = function(id){
    return Post.deleteOne({_id: id})
}

module.exports.alterar = function(t){
    return Post.findByIdAndUpdate({_id: t._id}, t, {new: true})
}
