var express = require('express');
var router = express.Router();
var axios = require('axios')
var jwt = require('jsonwebtoken');
var multer = require('multer');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './../api-server/uploads/');
  },
  filename: function(req, file, cb) {
    var decoded = jwt.decode(req.cookies.token, {complete: true});

    cb(null, decoded.payload._id +'-'+file.originalname);
  }
});
// Init Upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

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
   res.render('index', {noticias: json, user: "logged"})
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
    res.render('login');
});

/* Manda os dados do login do utilizador para o servidor de autenticação. Se correr bem recebe um token de sessão */
router.post('/login', function(req,res) {
  console.log(req.body)
  /*
  if (req.body.password2!=req.body.password) {
    req.flash('warning','Passwords diferentes!')
    res.redirect('/login')
  }*/
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


router.get('/recursos/upload', function(req, res, next) {
  res.render('upload', {user: "logged"})
});


/* GET recursos page */
router.get('/recursos', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.get('http://localhost:8001/recursos?token=' + req.cookies.token)
    .then(dados => res.render('recursos', {recursos: dados.data, user: "logged"}))
    .catch(e => res.render('error', {error: e}))
})
/*
router.get('/recursos/editar/:id', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.get('http://localhost:8001/recursos?token=' + req.cookies.token)
    .then(dados => res.render('recursos', {recursos: dados.data, user: "logged"}))
    .catch(e => res.render('error', {error: e}))
})*/




/* GET recursos page */
router.get('/recursos/:id', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.get('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados => {
    var decoded = jwt.decode(req.cookies.token, {complete: true});
    
    if((decoded.payload.nivel=="producer" && decoded.payload.email == dados.emailP) || (decoded.payload.nivel=="admin")){
      res.render('recurso', {recurso: dados.data,tag: "edt", user: "logged"})
    }else{
      res.render('recurso', {recurso: dados.data, user: "logged"})
    }

  })
  .catch(e => res.render('error', {error: e}))
})

/* Download recurso page */
router.get('/download/:path', isLogged,function(req,res) {
  try {
    console.log(req)
    res.download(__dirname+ "/../../api-server/uploads/"+req.params.path)
  } catch (error) {
    console.log(error)
  }
})

/* DELETE recurso */
router.get('/recursos/remover/:id', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.delete('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados =>{
    req.flash('success','Recurso removido com sucesso!')
    res.redirect('/recursos')

  })
  .catch(e =>{
    req.flash('danger','Recurso não foi removido com sucesso!')
    res.redirect('/recursos/'+req.params.id)
  })
})


router.post("/recursos", isLogged, upload.single('myFile'), (req, res, next) => {
  var decoded = jwt.decode(req.cookies.token, {complete: true});
  req.body["path"] = decoded.payload._id +'-'+ req.file.originalname 
  req.body["produtor"]={}
  req.body.produtor["nomeP"] = decoded.payload.nome 
  req.body.produtor["emailP"] = decoded.payload.email 
  if(req.body.visibilidade == '1'){req.body.visibilidade = true}
  else {req.body.visibilidade = false}

  axios.post('http://localhost:8001/recursos?token=' + req.cookies.token, req.body)
  .then( dados => {
    req.flash('success','Recurso adicionado com sucesso!')
    res.redirect('/recursos')
  })
  .catch( erro => { 
    req.flash('danger','Recurso não foi registado com sucesso!')
    res.redirect('/recursos/upload')
    
  })
})



/* GET registo page. */
router.get('/registo', function(req, res, next) {
  res.render('registo');
});


/* Regista um novo utilizador na base de dados através do api-server */
router.post('/registo', function(req,res) {
  if(req.body.password != req.body.password2){
    req.flash('danger','Passwords não correspondem!')
    res.redirect('/registo')
  }else{
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
  }
})


/* GET recursos page */
router.get('/posts', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.get('http://localhost:8001/posts?token=' + req.cookies.token)
    .then(dados => res.render('posts', {posts: dados.data, user: "logged"}))
    .catch(e => res.render('error', {error: e}))
})

/* GET recursos page */
router.get('/posts/:id', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.get('http://localhost:8001/posts/'+req.params.id+'?token=' + req.cookies.token)
    .then(dados => res.render('posts', {recursos: dados.data, user: "logged"}))
    .catch(e => res.render('error', {error: e}))
})


/* Regista um novo utilizador na base de dados através do api-server 
router.post('/posts', function(req,res) {
  axios.post('http://localhost:8001/posts', req.body)
    .then( dados => {
      req.flash('success','Post adicionado com sucesso!')
      res.redirect('/posts/'+dados._id)
    })
    .catch( erro => { 
      req.flash('warning','Erro na criação do post!')
      res.redirect('/posts')
  })
})*/

/* GET perfil page */
router.get('/perfil', isLogged, function(req,res) {
  console.log("token na app: "+req.cookies.token)
  var decoded = jwt.decode(req.cookies.token, {complete: true});
  axios.get('http://localhost:8001/utilizadores/'+decoded.payload._id+'?token=' + req.cookies.token)
    .then(dados => res.render('perfil', {utilizador: dados.data, user: "logged"}))
    .catch(e => res.render('error', {error: e}))
})


function isLogged(req, res, next){
    if(req.cookies.token){
    next();
   } else {
    res.redirect("/login")
   }
}

module.exports = router;
