const express = require('express');
const router = express.Router();

router.get('/', ensureAuthenticated,function(req,res){
    res.render('index');
})


function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

module.exports = router;