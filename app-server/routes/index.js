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
router.get('/', isLogged, function(req,res) {
   console.log("render index")
   res.render('index', {noticias: json, user: {"nome":"joao"}})
})

/* GET home page */
router.get('/.', isLogged, function(req,res) {
  console.log(req.body);
  axios.get('http://localhost:8001/noticias?token=' + req.cookies.token)
    .then(dados => res.render('index', {noticias: dados.data}))
    // se nao obtem os dados é porque o token está expirado, redireciona para o login
    .catch(e =>  { res.redirect('/login') })
})


/* GET login page. */
router.get('/login', function(req, res, next) {
    res.render('login', {login: "login"});
});

/* Manda os dados do login do utilizador para o servidor de autenticação. Se correr bem recebe um token de sessão */
router.post('/login', function(req,res) {
  console.log(req.body)
  axios.post('http://localhost:8002/utilizador/login', req.body)
    .then(dados => {
      //guardar o token vindo da autenticação
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, 
        httpOnly: true
      });
      res.redirect('/')
    })
    .catch(erro => res.render('error', {error: erro}))
})

/* GET registo page. */
router.get('/logout', function(req, res, next) {
  res.clearCookie("token")
  res.redirect('/login')
});


/* GET recursos page */
router.get('/recursos', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.get('http://localhost:8001/recursos?token=' + req.cookies.token)
    .then(dados => res.render('recursos', {recursos: dados.data,  user: req}))
    .catch(e => res.render('error', {error: e}))
})


/* GET registo page. */
router.get('/registo', function(req, res, next) {
  res.render('registo');
});


/* Regista um novo utilizador na base de dados através do api-server */
router.post('/registo', function(req,res) {
  axios.post('http://localhost:8001/utilizadores/registo', req.body)
    .then( dados => {
      req.flash('success','Utlizador registado com sucesso!')
      res.redirect('/login')
    })
    .catch( erro => { 
      try {
        if (erro.response.data.error.keyValue.email!=null){ 
        req.flash('warning','Email já existente!')
        res.redirect('/registo')
      }
      }
      catch{ 
        req.flash('danger','Utlizador não foi registado com sucesso!')
        res.redirect('/registo')
      } 
  })
})

function isLogged(req, res, next){
 
    if(req.cookies.token){
    console.log("try if")
    next();
   } else {
    console.log("catch")

    res.redirect("/login")
   }
  
}

module.exports = router;
