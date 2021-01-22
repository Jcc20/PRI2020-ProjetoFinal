var express = require('express');
var router = express.Router();
const Recurso = require('../controllers/recurso')


/* GET home page. */
router.get('/', function(req, res) {
  const page = req.query.page ? parseInt(req.query.page) : 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 10
  Recurso.listar(page, limit)
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
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
