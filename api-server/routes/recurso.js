var express = require('express');
var router = express.Router();
const Recurso = require('../controllers/recurso')


/* GET home page. */
router.get('/', function(req, res) {
  var page, limit
  req.query.page ?  page = parseInt(req.query.page)   : page = 1
  req.query.limit ? limit = parseInt(req.query.limit) : limit = 10
  if(req.query.byTipo != null){
    Recurso.listarbyTipo(page, limit)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else if(req.query.byTitulo != null){
    Recurso.listarbyTitulo(page, limit)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else  if(req.query.byData != null){
    Recurso.listarbyData(page, limit)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else  if(req.query.byDataRegisto != null){
    Recurso.listarbyDataRegisto(page, limit)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else if(req.query.byAutor != null){
    Recurso.listarbyAutor(page, limit)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else if(req.query.page != null){
    Recurso.listar(page, limit)
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
  }else {
    Recurso.contarTodos()
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
  }
});

router.get('/:id', function(req, res) {
  Recurso.consultar(req.params.id)
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
});
  
// Inserir um recurso
router.post('/', function(req, res){
  Recurso.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => {
      console.log(e)
      res.status(500).jsonp({error: e})
    })
})

// Alterar um recurso
router.put('/', function(req, res){
  Recurso.alterar(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Remover um recurso
router.delete('/:id', function(req, res) {
  Recurso.remover(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});


module.exports = router;
