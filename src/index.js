// Dependencies
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const nodemailer = require('nodemailer');
const log = console.log;

// Initializations
    // bootstrap app
const app = express();
    // mongoose connect
require('./database');
    //passport 
require('./config/passport');
    // email
require('./config/email');

// Settings

    // local and cloud
app.set('port', process.env.PORT || 4000);
    
    // path views concatenate to src > src/views
app.set('views', path.join(__dirname, 'views'));
    // handlebars > engine template
app.engine('.hbs', exphbs({
    defaultLayout:'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname:'.hbs'
}));
    // tell to app the engine template
app.set('view engine', '.hbs');

// Middlewares 
    // receive only data for authentication
app.use(express.urlencoded({extended:false}));
    // forms can request put and delete
app.use(methodOverride('_method'));
    // management session
app.use(session({
    secret:'secretbosco',
    resave:true,
    saveUninitialized:true
}));
//  passport
app.use(passport.initialize());
app.use(passport.session());
// flash for send messages to the user
app.use(flash());

// Global variables
    // store messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.errors_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('sucessfull');
    res.locals.user = req.user || null; 
    next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/users'));
app.use(require('./routes/products'));
app.use(require('./routes/notes'));

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Server is listening
app.listen(app.get('port'), () => {
    console.log('App listening in port', app.get('port'));
});

