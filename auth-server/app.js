var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt');
var { v4: uuidv4 } = require('uuid');
var session = require('express-session');
const FileStore = require('session-file-store')(session);

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Pri2020PFDB', 
      { useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
  console.log("Conexão ao MongoDB realizada com sucesso...")
});        

var Utilizador = require('./controllers/utilizador')

// Configuração da estratégia local
passport.use(new LocalStrategy(
  {usernameField: 'email'}, (email, password, done) => {
    Utilizador.consultar(email)
      .then(dados => {
        const utilizador = dados
        if(!utilizador) { return done(null, false, {message: 'Utilizador inexistente!\n'})}
        bcrypt.compare(password, utilizador.password).then(function(result) {
          if(!result) { return done(null, false, {message: 'Credenciais inválidas!\n'})}
      
          var date = new Date().toLocaleString('pt-PT', { hour12: false});
          utilizador.dataUltimoAcesso=date
          Utilizador.alterar(utilizador)
          .then(d => {
            return done(null, utilizador)
          })
          .catch(erro => done(erro))
        });
      })
      .catch(erro => done(erro))
    })
)

// Indica-se ao passport como serializar o utilizador
passport.serializeUser((utilizador,done) => {
  console.log('Serielização, email: ' + utilizador.email)
  done(null, utilizador.email)
})
  
// Desserialização: a partir do id obtem-se a informação do utilizador
passport.deserializeUser((email, done) => {
  console.log('Desserielização, email: ' + email)
  Utilizador.consultar(email)
    .then(dados => done(null, dados))
    .catch(erro => done(erro, false))
})

var utilizadorRouter = require('./routes/utilizador');

var app = express();

app.use(session({
  genid: req => {
    return uuidv4()
  },
  store: new FileStore({retries: 2}),
  secret: 'O meu segredo',
  resave: false,
  saveUninitialized: false
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('O meu segredo'));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
  console.log('Signed Cookies: ', JSON.stringify(req.signedCookies))
  console.log('Session: ', JSON.stringify(req.session))
  next()
})

app.use('/utilizador', utilizadorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).jsonp({error: err.message})
});

module.exports = app;
