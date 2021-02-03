var express = require('express');
var router = express.Router();
var axios = require('axios')
var jwt = require('jsonwebtoken');
var multer = require('multer');
var dateFormat = require('dateformat');

var MultererrorMessages = {
  LIMIT_PART_COUNT: 'Too many parts',
  LIMIT_FILE_SIZE: 'Ficheiro demasiado grande',
  LIMIT_FILE_COUNT: 'Demasiados ficheiros',
  LIMIT_FIELD_KEY: 'Field name too long',
  LIMIT_FIELD_VALUE: 'Field value too long',
  LIMIT_FIELD_COUNT: 'Too many fields',
  LIMIT_UNEXPECTED_FILE: 'Unexpected field'
}
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
    fileSize: 1024 * 1024 * 5 * 3
  }
}).single('myFile');



/* GET home page */
router.get('/', isLogged, function(req,res) {

  axios.get('http://localhost:8001/recursos?byDataRegisto=true&token=' + req.cookies.token)
  .then(recursos => {
     axios.get('http://localhost:8001/posts?token=' + req.cookies.token)
    .then(posts => {
        //pegar nos recursos e nos posts e meter numa lista
        var noticias = []
        recursos.data.forEach( a => {if (a.visibilidade==true) noticias.push(a)})
        posts.data.forEach( a => noticias.push(a))
        //ordenar por dataRegisto do maior para o menor
        noticias.sort(compareByDataRegisto)
        //limitar a 8 noticias
        var lastNews = []
        var i = 0
        for(n of noticias) {
          if (i < 8) {lastNews.push(n); i++}
          else break
        }
        res.render('index', {noticias: lastNews, user: "logged"})
    })
    .catch(e => res.render('error', {error: e}))
  })
  .catch(e => res.render('error', {error: e}))
  


})

function compareByDataRegisto( a, b ) {
  if ( a.dataRegisto < b.dataRegisto ) return 1;
  if ( a.dataRegisto > b.dataRegisto ) return -1;
  return 0;
}

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
    .catch(erro => {
      req.flash('danger','Password ou e-mail incorretos!')
      res.redirect('/login')
    })
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
  var page, limit
  req.query.page ? page=parseInt(req.query.page) : page=1
  req.query.limit ? limit=parseInt(req.query.limit) : limit=10
  var query=""
  if(req.query.byTipo){query='byTipo=true'}
  if(req.query.byTitulo){query='byTitulo=true'}
  if(req.query.byData){query='byData=true'}
  if(req.query.byAutor){query='byAutor=true'}

  axios.get('http://localhost:8001/recursos?&token=' + req.cookies.token)
  .then(dados => {
    var decoded = jwt.decode(req.cookies.token, {complete: true});
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const results = {}
    results["atual"] = page
    results["query"] = query
    results["limit"] = limit
    if (endIndex < dados.data) results["next"]     = page + 1
    if (startIndex > 0)        results["previous"] = page - 1
    
    axios.get('http://localhost:8001/recursos?'+query+'&limit='+limit+'&page='+page+'&email='+decoded.payload.email+'&level='+decoded.payload.nivel+'&token=' + req.cookies.token)
    .then(dados => res.render('recursos', {recursos: dados.data, pag: results, user: "logged"}))
    .catch(e => res.render('error', {error: e}))
  })
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
    var arr = dados.data.ranking.classf
    var le =  {
        "leng": arr.length
    }
    var vot = 0
    if(arr.some(p => p == decoded.payload._id)){
      vot = 1
    }
    if((decoded.payload.email == dados.data.produtor.emailP) || (decoded.payload.nivel=="admin")){
      res.render('recurso', {recurso: dados.data,voted: vot, leng: le, tag: "edt", user: "logged"})
    }else{
      res.render('recurso', {recurso: dados.data,voted: vot, leng: le,  user: "logged"})
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


router.post("/recursos", isLogged, (req, res, next) => {
  upload(req, res, function (err) {
    //tramento do erro se for do multer
    if (err instanceof multer.MulterError) {
      var msg = MultererrorMessages[err.code]
      console.log(msg)

      req.flash('danger',msg)
      res.redirect('/recursos/upload')
    } else if (err) {
      req.flash('danger','Recurso não foi registado com sucesso!')
      res.redirect('/recursos/upload')
    }else{
      //Tratamento do body
      var decoded = jwt.decode(req.cookies.token, {complete: true});
      req.body["path"] = decoded.payload._id +'-'+ req.file.originalname 
      req.body["produtor"]={}
      req.body.produtor["nomeP"] = decoded.payload.nome 
      req.body.produtor["emailP"] = decoded.payload.email 
      if(req.body.visibilidade == '1'){req.body.visibilidade = true}
      else {req.body.visibilidade = false}
      
      axios.post('http://localhost:8001/recursos?token=' + req.cookies.token, req.body)
      .then( dados => {
        //Verificar se é consumer, se for mudar nivel para producer
        if(decoded.payload.nivel=="consumer"){
          var bod = {
            "_id": decoded.payload._id,
            "nivel": "producer"
          }
          console.log("tratar do producer")
          axios.put('http://localhost:8001/utilizadores?token=' + req.cookies.token, bod)
          .then( dados => { 
            console.log("tratar do producer1")

            req.flash('success','Recurso adicionado com sucesso!')
            res.redirect('/recursos')
          })
          .catch( erro => { 
            console.log("tratar do producer2")

            req.flash('danger','Recurso não foi registado com sucesso!')
            res.redirect('/recursos/upload')
            
          })
        }
        req.flash('success','Recurso adicionado com sucesso!')
        res.redirect('/recursos')
      })
      .catch( erro => { 
        req.flash('danger','Recurso não foi registado com sucesso!')
        res.redirect('/recursos/upload')
        
      })
    }
  })
})


router.post("/recursos/classificar/:id", isLogged, (req, res, next) => {
 
  axios.get('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados => {
    var decoded = jwt.decode(req.cookies.token, {complete: true});

    classf = dados.data.ranking.classf
    classf.push(decoded.payload._id)
    console.log(classf)

    var cl 
    var rate = req.body.rating

    if(dados.data.ranking.rating){
      var arr = dados.data.ranking.classf
      cl =  (dados.data.ranking.rating * (arr.length-1)) 
      cl = (+cl + +rate)/(arr.length)
    }else {
      cl=rate
    }
    var bod = {
      "_id": req.params.id,
      "ranking":{
          "rating": cl,
          "classf": classf
      } 
    }

    axios.put('http://localhost:8001/recursos?token=' + req.cookies.token, bod)
    .then( dados => { 

      req.flash('success','Recurso classificado com sucesso!')
      res.redirect('/recursos/'+req.params.id)
    })
    .catch( erro => { 
    

      req.flash('danger','Recurso não foi classificado com sucesso!')
      res.redirect('/recursos/'+req.params.id)
      
    })
  })
  .catch(e => res.render('error', {error: e}))
})


/* GET registo page. */
router.get('/registo', function(req, res, next) {
  res.render('registo');
})


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


/* GET posts page */
router.get('/posts', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  if (req.query.search!=null) {
    axios.get('http://localhost:8001/posts?search='+ req.query.search +'&token=' + req.cookies.token)
      .then(dados => res.render('posts', {posts: dados.data, username: "joao", user: "logged"}))
      .catch(e => res.render('error', {error: e}))
  }
  else 
    axios.get('http://localhost:8001/posts?token=' + req.cookies.token)
      .then(dados => res.render('posts', {posts: dados.data, username: "joao", user: "logged"}))
      .catch(e => res.render('error', {error: e}))
})


/* GET posts page */
router.get('/posts/:id', isLogged,function(req,res) {
  console.log("token na app: "+req.cookies.token)
  axios.get('http://localhost:8001/posts/'+req.params.id+'?token=' + req.cookies.token)
    .then(dados => res.render('posts', {recursos: dados.data, user: "logged"}))
    .catch(e => res.render('error', {error: e}))
})




/* GET perfil page */
router.get('/perfil', isLogged, function(req,res) {
  var decoded = jwt.decode(req.cookies.token, {complete: true});
  axios.get('http://localhost:8001/utilizadores/'+decoded.payload._id+'?token=' + req.cookies.token)
    .then(dados => {
      dados.data.dataRegisto=dateFormat(dados.data.dataRegisto, "mmmm dS, yyyy");
      if((decoded.payload.email == dados.data.email)){
        res.render('perfil', {utilizador: dados.data,tag: "edt", user: "logged"})
      }else{
        res.render('perfil', {utilizador: dados.data, user: "logged"})
    }})
    .catch(e => res.render('error', {error: e}))
})




/* GET editar perfil page */
router.get('/perfil/editar', isLogged, function(req,res) {
   var decoded = jwt.decode(req.cookies.token, {complete: true});
  axios.get('http://localhost:8001/utilizadores/'+decoded.payload._id+'?token=' + req.cookies.token)
    .then(dados => {
        dados.data.dataRegisto=dateFormat(dados.data.dataRegisto, "mmmm dS, yyyy");
        res.render('editarPerfil', {utilizador: dados.data, user: "logged"})
      })
    .catch(e => res.render('error', {error: e}))
})

/* PUT editar perfil page */
router.post('/perfil/editar', function(req,res) {
  var decoded = jwt.decode(req.cookies.token, {complete: true});
  req.body["_id"] = decoded.payload._id
  console.log(req.body)
  axios.put('http://localhost:8001/utilizadores?token=' + req.cookies.token, req.body)
   .then(dados => {
       req.flash('success','Perfil alterado com sucesso!')
       res.redirect('/perfil')
     })
   .catch(e => {
      req.flash('danger','Perfil não foi alterado com sucesso!')
      res.redirect('/perfil')
   })
})

/* GET perfil by email page */
router.get('/perfil/:email', isLogged, function(req,res) {
  var decoded = jwt.decode(req.cookies.token, {complete: true});
  axios.get('http://localhost:8001/utilizadores/'+req.params.email+'?byEmail=true&token=' + req.cookies.token)
    .then(dados => {
      dados.data.dataRegisto=dateFormat(dados.data.dataRegisto, "mmmm dS, yyyy");
      if((decoded.payload.email == dados.data.email)){
        res.render('perfil', {utilizador: dados.data,tag: "edt", user: "logged"})
      }else{
        res.render('perfil', {utilizador: dados.data, user: "logged"})
    }})
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
