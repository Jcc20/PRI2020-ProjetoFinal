var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* Manda os dados do login do utilizador para o servidor de autenticação. Se correr bem recebe um token de sessão */
router.post('/login', function(req,res) {
  console.log(req.body)
  axios.post('http://localhost:8002/utilizadores/login', req.body)
    .then(dados => {
      //localStorage.setItem('myToken', dados.data.token);
      //guardar o token vindo da autenticação
      res.redirect('/')
    })
    .catch(erro => res.render(error, {error: erro}))
})


/* GET login page. */
router.get('/registo', function(req, res, next) {
  res.render('registo');
});


/* Regista um novo utilizador na base de dados através do api-server */
router.post('/registo', function(req,res) {
  console.log(req.body)
  axios.post('http://localhost:8001/utilizadores/registo', req.body)
    .then(dados => {
      res.redirect('/login', dados)
    })
    .catch(erro => res.render(error, {error: erro}))
})

module.exports = router;
