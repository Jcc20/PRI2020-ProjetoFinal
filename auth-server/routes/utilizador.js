var express = require('express');
var router = express.Router();
var Utilizador = require('../controllers/utilizador')

var passport = require('passport')
var jwt = require('jsonwebtoken')

router.get('/logout', function(req, res){
  req.logout();
  req.session.destroy(function (err) {
    if (!err) {
        res.redirect('/');
    } else {
        console.log('Destroy session error: ', err)
    }
  });
});

router.post('/login',passport.authenticate('local') , function(req, res){
  jwt.sign({_id: req.user._id, email: req.user.email, nome: req.user.nome, nivel: req.user.nivel},
    'PRI2020',
    {expiresIn: "3h"},
    function(e, token) {
      if (e) res.status(500).jsonp({error:"Erro na geração do token: " + e})
      else res.status(201).jsonp({token: token})
    });
})

module.exports = router;