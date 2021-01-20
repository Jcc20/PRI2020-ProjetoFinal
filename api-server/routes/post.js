var express = require('express');
var router = express.Router();
const Post = require('../controllers/post')


/* GET home page. */
router.get('/', function(req, res) {
    Post.listar()
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
});

// Inserir um post
router.post('/', function(req, res){
    Post.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Alterarum post
router.put('/', function(req, res){
    Post.alterar(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Remover um post
router.delete('/:id', function(req, res) {
    Post.remover(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});


module.exports = router;
