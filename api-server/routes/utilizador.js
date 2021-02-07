var express = require('express');
var router = express.Router();
const Utilizador = require('../controllers/utilizador')


// Consultar os utilizadores
router.get('/', function(req, res) {
  Utilizador.listar()
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
});


// Consultar um utilizador
router.get('/:id', function(req, res) {
  if(req.query.byEmail != null){
    Utilizador.consultarByEmail(req.params.id)
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
  }
  else {
    Utilizador.consultar(req.params.id)
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
  }
});


// Inserir um utilizador
router.post('/', function(req, res){
  Utilizador.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Alterar uma utilizador
router.put('/', function(req, res){
  Utilizador.alterar(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})


// Remover uma utilizador
router.delete('/:id', function(req, res) {
  Utilizador.remover(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});


module.exports = router;
