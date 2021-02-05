// Controlador para o modelo Post

var Post = require('../models/post')

// Devolve a lista de posts
module.exports.listar = () => {
    return Post
        .find()
        .sort( {dataRegisto : -1 } )
        .exec()
}

module.exports.search = (text) => {
    return Post
        .find({ titulo: {$regex : ".*"+text+".*"} })
        .sort( {dataRegisto : -1} )
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

module.exports.removerComent = function(id,idC){
    return Post.find({ _id: id })
               .deleteOne({ 'comentarios._idC' : idC})
}

module.exports.alterar = function(t){
    return Post.findByIdAndUpdate({_id: t._id}, t, {new: true})
}
