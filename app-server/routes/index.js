var express = require('express');
var router = express.Router();
var axios = require('axios')
var jwt = require('jsonwebtoken');
var fs = require('fs');
var multer = require('multer');
var dateFormat = require('dateformat');
var AdmZip = require('adm-zip');
var crypto = require('crypto')
const bcrypt = require('bcrypt');
const saltRounds = 10;
var filehash = 0;

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
    cb(null, './../app-server/uploadsTemp/');
  },
  filename: function(req, file, cb) {
    var decoded = jwt.decode(req.cookies.token, {complete: true});
    
    var x = decoded.payload.email
    var hash = crypto.createHash('sha1').update(x).digest('hex')
    filehash= hash
    
  
    cb(null, filehash+'-'+file.originalname);
  }
});
// Init Upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 * 15//15mb
  }
}).array('myFile');



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

/* Logout */
router.get('/logout', function(req, res, next) {
  res.clearCookie("token")
  res.redirect('/login')
});

/* GET upload page */
router.get('/recursos/upload', function(req, res, next) {
  res.render('upload', {user: "logged"})
});


/* GET recursos page */
router.get('/recursos', isLogged,function(req,res) {
  var page, limit
  req.query.page ? page=parseInt(req.query.page) : page=1
  req.query.limit ? limit=parseInt(req.query.limit) : limit=10
  var query=""
  if(req.query.byTipo){query='byTipo=true'}
  if(req.query.byTitulo){query='byTitulo=true'}
  if(req.query.byData){query='byData=true'}
  if(req.query.byAutor){query='byAutor=true'}
  if(req.query.byClassif){query='byClassif=true'}
  if(req.query.search) {query='search='+req.query.search}
  if(query == ""){query='byData=true'}

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




/* GET recurso page */
router.get('/recursos/:id', isLogged,function(req,res) {
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
  .catch(e => {
    req.flash('danger','Não foi possível encontrar o recurso!')
    res.redirect('/posts')
  })
})

/* Download recurso  */
router.get('/download/:path', isLogged,function(req,res) {
  try {
    res.download(__dirname+ "/../../app-server/uploads/"+req.params.path)
  } catch (error) {
    console.log(error)
  }
})

/* DELETE recurso */
router.get('/recursos/remover/:id', isLogged,function(req,res) {
  var path
  axios.get('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados => {
    path =  dados.data.path
  })
  .catch(e => res.render('error', {error: e}))

  axios.delete('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados =>{
    
    fs.unlinkSync('./../app-server/uploads/'+path)
    req.flash('success','Recurso removido com sucesso!')
    res.redirect('/recursos')

  })
  .catch(e =>{
    req.flash('danger','Recurso não foi removido com sucesso!')
    res.redirect('/recursos/'+req.params.id)
  })
})


/* POST recurso */
router.post("/recursos", isLogged, (req, res, next) => {
  upload(req, res, function (err) {
    //tramento do erro se for do multer
    if (err instanceof multer.MulterError) {
      var msg = MultererrorMessages[err.code]

      req.flash('danger',msg)
      res.redirect('/recursos/upload')
    } else if (err) {
      req.flash('danger','Recurso não foi registado com sucesso!')
    
      res.redirect('/recursos/upload')
    }else{
      //Tratamento do body
      var decoded = jwt.decode(req.cookies.token, {complete: true});
      var zip = new AdmZip();
      
      req.files.forEach(f => {
      
        zip.addLocalFile("./../app-server/uploadsTemp/"+filehash+'-'+f.originalname);
        var dir = "./../app-server/uploadsTemp/"+filehash+'-'+f.originalname
        fs.unlinkSync(dir)
        
        
      });
      var time = Date.now()
      zip.writeZip("./../app-server/uploads/"+filehash+'-'+time+'.zip')

      req.body["path"] = filehash+'-'+time+'.zip'
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
          axios.put('http://localhost:8001/utilizadores?token=' + req.cookies.token, bod)
          .then( dados => { 

            req.flash('success','Recurso adicionado com sucesso!')
            res.redirect('/recursos')
          })
          .catch( erro => { 

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


/* Classificar recurso */
router.post("/recursos/classificar/:id", isLogged, (req, res, next) => {
 
  axios.get('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados => {
    var decoded = jwt.decode(req.cookies.token, {complete: true});

    classf = dados.data.ranking.classf
    classf.push(decoded.payload._id)

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



router.post("/recursos/visibilidade/:id", isLogged, (req, res, next) => {
 
  axios.get('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados => {
    if (dados.data.visibilidade==true) dados.data.visibilidade=false
    else dados.data.visibilidade=true
    axios.put('http://localhost:8001/recursos?token=' + req.cookies.token, dados.data)
    .then( dados => { 
      req.flash('success','Visiblidade do recurso alterada com sucesso!')
      res.redirect('/recursos/'+req.params.id)
    })
    .catch( erro => { 
      req.flash('danger','Visiblidade do recurso não foi alterada com sucesso!')
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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      req.body.password = hash
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
    });
  }
})


/* GET posts page */
router.get('/posts', isLogged,function(req,res) {
  var decoded = jwt.decode(req.cookies.token, {complete: true});
  if (req.query.search!=null) {
    axios.get('http://localhost:8001/posts?search='+ req.query.search +'&token=' + req.cookies.token)
      .then(dados => res.render('posts', {posts: dados.data, level: decoded.payload.nivel, email: decoded.payload.email, user: "logged"}))
      .catch(e => res.render('error', {error: e}))
  }
  else 
    axios.get('http://localhost:8001/posts?token=' + req.cookies.token)
      .then(dados => res.render('posts', {posts: dados.data, level: decoded.payload.nivel, email: decoded.payload.email, user: "logged"}))
      .catch(e => res.render('error', {error: e}))
})


/* GET post page */
router.get('/posts/:id', isLogged,function(req,res) {
  axios.get('http://localhost:8001/posts/'+req.params.id+'?token=' + req.cookies.token)
    .then(dados => res.render('posts', {posts: [dados.data], user: "logged"}))
    .catch(e => res.render('error', {error: e}))
})




/* POST de um comentário */
router.post('/posts/comentario/:id', isLogged,  (req, res, next) => {
  axios.get('http://localhost:8001/posts/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados => {
    var decoded = jwt.decode(req.cookies.token, {complete: true});
    var json = {
      "emailC" : decoded.payload.email,
      "nomeC" : decoded.payload.nome,
      "comentario": req.body.comentario
    }
    dados.data.comentarios.push(json)   
    axios.put('http://localhost:8001/posts?token=' + req.cookies.token, dados.data)
    .then(dados => res.redirect('/posts'))
    .catch(e => res.render('error', {error: e}))
    
  })
  .catch(e => res.render('error', {error: e}))
})


/* POST de um post */
router.post('/posts/:id', isLogged,  (req, res, next) => {
  var decoded = jwt.decode(req.cookies.token, {complete: true});
  axios.get('http://localhost:8001/recursos/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados => {
    req.body["autor"]={}
    req.body.autor["nomeA"] = decoded.payload.nome 
    req.body.autor["emailA"] = decoded.payload.email 
    req.body["rec"]={}
    req.body.rec["idRec"] = req.params.id
    req.body.rec["titRec"] = dados.data.titulo
    axios.post('http://localhost:8001/posts?token=' + req.cookies.token,req.body)
    .then(dados => {
      res.redirect("/posts")
    })
    .catch(e => res.render('error', {error: e}))
  })
  .catch(e => res.render('error', {error: e}))
})


/* Remover post */
router.get('/posts/remover/:id', isLogged,function(req,res) {
  axios.delete('http://localhost:8001/posts/'+req.params.id+'?token=' + req.cookies.token)
  .then(dados =>{
    req.flash('success','Post removido com sucesso!')
    res.redirect('/posts')
  })
  .catch(e =>{
    req.flash('danger','Post não foi removido com sucesso!')
    res.redirect('/posts/'+req.params.id)
  })
})


/* Remover comentário */
router.get('/posts/remover/:id/comentario/:idC', isLogged,function(req,res) {
  axios.delete('http://localhost:8001/posts/'+req.params.id+'/comentario/'+req.params.idC+'?token=' + req.cookies.token)
  .then(dados =>{
    req.flash('success','Comentário removido com sucesso!')
    res.redirect('/posts')
  })
  .catch(e =>{
    req.flash('danger','Comentário não foi removido com sucesso!')
    res.redirect('/posts/'+req.params.id)
  })
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
  var body = {}
  body["_id"] = decoded.payload._id
  body["filiacao"] = req.body.filiacao

  if (req.body.oldpassword == "" && req.body.newpassword == "" && req.body.new2password == "") {
    axios.put('http://localhost:8001/utilizadores?token=' + req.cookies.token, body)
    .then(dados => {
        req.flash('success','Perfil alterado com sucesso!')
        res.redirect('/perfil')
      })
    .catch(e => {
       req.flash('danger','Perfil não foi alterado com sucesso!')
       res.redirect('/perfil')
    })
  }
  else if (req.body.oldpassword != "" && req.body.newpassword != "" && req.body.new2password != "") {
    axios.get('http://localhost:8001/utilizadores/'+decoded.payload._id+'?token=' + req.cookies.token) 
      .then(dados => {
        bcrypt.compare(req.body.oldpassword, dados.data.password)
        .then(function(result) {
          if(!result) { 
            req.flash('danger','Perfil não foi alterado com sucesso!')
            res.redirect('/perfil/editar')
          }
          else {
            if(req.body.newpassword != req.body.new2password){
              req.flash('danger','Passwords não correspondem!')
              res.redirect('/perfil/editar')
            }
            else {
              bcrypt.hash(req.body.newpassword, saltRounds, function(err, hash) {
                body["password"] = hash
                  axios.put('http://localhost:8001/utilizadores?token=' + req.cookies.token, body)
                .then(dados => {
                     req.flash('success','Perfil alterado com sucesso!')
                     res.redirect('/perfil')
                   })
                .catch(e => {
                    req.flash('danger','Perfil não foi alterado com sucesso!')
                    res.redirect('/perfil')
                })
              })
            }
          }
        })
      })
      .catch(e => {
       req.flash('danger','Perfil não foi alterado com sucesso!')
       res.redirect('/perfil/editar')
      })  
  }
  else {
    req.flash('danger','Perfil não foi alterado com sucesso!')
    res.redirect('/perfil/editar')
  }
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
    var myToken = req.cookies.token 
    jwt.verify( myToken, 'PRI2020', function(e, payload){
      if(e){
        res.clearCookie("token")
        res.redirect("/login")
      }
      else{
        next()
      } 
    })
  }else {
    res.redirect("/login")
  }
}

module.exports = router;
