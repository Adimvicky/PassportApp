const express = require('express');
const bcrypt = require('bcryptjs');
const mongojs = require('mongojs');
const db = mongojs('passportapp',['users']);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();

// Login - GET
router.get('/login', function(req,res){
    res.render('login');
})

// Register - GET
router.get('/register', function(req,res){
    res.render('register');
})

// Register - POST

router.post('/register', function(req, res){
    // Grabbing Form Values
    
    var name = req.body.name,
        email = req.body.email,
        username = req.body.username,
        password = req.body.password,
        password2 = req.body.password2;

    // Validation
    req.checkBody('name','Name field is required').notEmpty();
    req.checkBody('email','Please enter a valid email address').isEmail();
    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2','Passwords do not match').equals(password);

    var errors = req.validationErrors();

    if(errors){
        console.log('Form has errors..')
        res.render('register',{
            errors : errors,
            name : name,
            email : email,
            username : username,
            password : password,
            password2 : password2
        })
    } else {
        var newUser = {
            name : name,
            email : email,
            username : username,
            password : password 
        }

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err,hash){
                newUser.password = hash;

                db.users.insert(newUser, function(err, user){
                    if(err){ 
                         res.send('Error..')
                     } else { 
                         console.log('User added..')
        
                         req.flash('success', 'You are now registered, Login');
        
                         res.redirect('/');
                         
                    }
                })
            })
        })
    }       
})

passport.serializeUser(function(user, done){
    done(null, user._id);
})

passport.deserializeUser(function(id, done){
    db.users.findOne({ _id : mongojs.ObjectId(id) }, function(err, user){
        done(err, user);
    })
})

passport.use(new LocalStrategy(
    function(username, password, done){
        db.users.findOne({username : username}, function(err, user){
            if(err){ return done(err) }
            if(!user){
                return done(null, false, {message : 'Incorrect username'})
            }

            bcrypt.compare(password,user.password, function(err, isMatch){
                if(err){ return done(err) }
                if(isMatch){
                    return done(null, user)
                } else {
                    return done(null,false, {message : 'Incorrect password'})
                }
            })
        })
    }
))

// Login - POST

router.post('/login', 
   passport.authenticate('local', {
       successRedirect : '/',
       failureRedirect : '/users/login',
       failureFlash : 'Invalid Login details'
   }), function(req,res){
       console.log('Login successful')
       res.redirect('/');
   })


router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You have logged out')
    res.redirect('/users/login')
})

module.exports = router;