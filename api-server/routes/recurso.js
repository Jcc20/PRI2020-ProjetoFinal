var express = require('express');
var router = express.Router();
const Recurso = require('../controllers/recurso')


/* GET home page. */
router.get('/', function(req, res) {
  if(req.query.byTipo != null){
    Recurso.listarbyTipo(req.query.page)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else if(req.query.byTitulo != null){
    Recurso.listarbyTitulo(req.query.page)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else  if(req.query.byData != null){
    Recurso.listarbyData(req.query.page)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else if(req.query.byAutor != null){
    Recurso.listarbyAutor(req.query.page)
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  }else if(req.query.page != null){
    Recurso.listar(req.query.page)
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
