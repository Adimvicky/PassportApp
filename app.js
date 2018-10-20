const express = require('express'),
      path = require('path'),
      expressValidator = require('express-validator'),
      session = require('express-session'),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      bodyParser = require('body-parser'),
      flash = require('connect-flash');

const routes = require('./routes/index');
const users = require('./routes/users');

const app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));
app.use('/css',express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.use(session({
    secret : 'secret',
    saveUninitialized : true,
    resave : true
}));

app.use(passport.initialize());
app.use(passport.session());

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter : function(param,msg,value){
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while(namespace.length){
            formParam += '['+namespace.shift()+']'
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

// Connect-flash Middleware
app.use(flash());
app.use(function(req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
})


app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
})

// Routes

app.use('/', routes);
app.use('/users', users)



app.listen(3000, () => {
    console.log('App running on port 3000..')
})