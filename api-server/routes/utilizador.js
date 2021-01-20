var express = require('express');
var router = express.Router();
const Utilizador = require('../controllers/utilizador')


/* GET home page. */
router.get('/', function(req, res) {
  Utilizador.listar()
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
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
