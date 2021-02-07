var express = require('express');
var router = express.Router();
const Post = require('../controllers/post')


/* GET home page. */
router.get('/', function(req, res) {
 if (req.query.search != null) {
    Post.search(req.query.search)
     .then(dados => res.status(200).jsonp(dados) )
     .catch(e => res.status(500).jsonp({error: e}))
     }
 else {
    Post.listar()
     .then(dados => res.status(200).jsonp(dados) )
     .catch(e => res.status(500).jsonp({error: e}))
    }
});

router.get('/:id', function(req, res) {
    Post.consultar(req.params.id)
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

// Remover um comentario de um post
router.delete('/:id/comentario/:idC', function(req, res) {
    Post.removerComent(req.params.id, req.params.idC)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});



module.exports = router;
