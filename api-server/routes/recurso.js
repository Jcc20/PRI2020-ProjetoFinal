var express = require('express');
var router = express.Router();
const Recurso = require('../controllers/recurso')


/* GET home page. */
router.get('/', function(req, res) {
  Recurso.listar()
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
});

// Inserir uma utilizador
router.post('/', function(req, res){
  Recurso.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

module.exports = router;
