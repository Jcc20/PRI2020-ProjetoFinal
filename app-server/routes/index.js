var express = require('express');
var router = express.Router();
var axios = require('axios')

var json = [{
  "_id": "14",
  "tipo": "livro",
  "titulo": "o lobo mau",
  "subtitulo": "",
  "dataCriacao": "2021-1-15",
  "dataRegisto": "2021-2-19",
  "visibilidade": "publico",
  "produtor": "Joãozinho"
},{
  "_id": "19",
  "tipo": "cd",
  "titulo": "carapau sem espinha",
  "subtitulo": "corcunda",
  "dataCriacao": "2011-1-14",
  "dataRegisto": "2017-12-5",
  "visibilidade": "publico",
  "produtor": "Calvin"
},{
  "_id": "19",
  "tipo": "post",
  "titulo": "tudo mau",
  "data": "2011-1-14",
  "autor": "Calvin"
},{
  "_id": "55",
  "tipo": "post",
  "titulo": "galinha",
  "data": "2017-6-15",
  "autor": "Rui"
},{
  "_id": "19",
  "tipo": "cd",
  "titulo": "carapau sem espinha",
  "subtitulo": "corcunda",
  "dataCriacao": "2011-1-14",
  "dataRegisto": "2017-12-5",
  "visibilidade": "publico",
  "produtor": "Calvin"
},{
  "_id": "19",
  "tipo": "post",
  "titulo": "tudo mau",
  "data": "2011-1-14",
  "autor": "Calvin"
},{
  "_id": "55",
  "tipo": "post",
  "titulo": "galinha",
  "data": "2017-6-15",
  "autor": "Rui"
},{
  "_id": "19",
  "tipo": "cd",
  "titulo": "carapau sem espinha",
  "subtitulo": "corcunda",
  "dataCriacao": "2011-1-14",
  "dataRegisto": "2017-12-5",
  "visibilidade": "publico",
  "produtor": "Calvin"
}]


/* GET home page */
router.get('/', function(req,res) {
   res.render('index', {noticias: json, user: {"nome":"joao"}})
})

/* GET home page */
router.get('/recursos', function(req,res) {
  res.render('recursos', {recursos: json})
})


/* GET home page */
router.get('/.', function(req,res) {
  console.log(req.body);
  //var t = localStorage.getItem('myToken')
  var t = "token"
  axios.get('http://localhost:8001/noticias?token=' + t)
    .then(dados => res.render('index', {noticias: dados.data, user: req.body}))
    // se nao obtem os dados é porque o token está expirado, redireciona para o login
    .catch(e =>  { res.redirect('/login') })
})


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
      res.redirect('/', dados)
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
