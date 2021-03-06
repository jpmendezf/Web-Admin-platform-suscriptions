const express = require('express');
const router = express.Router();

// models
const User = require('../models/user');

// passport
const passport = require('passport');

// email
const { mailer } = require('../config/email');

// get form for signin
router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

// bring form signup
router.get('/users/signup', (req, res) => {
    res.render('users/signup');
});

// show all users
router.get('/users/all-users', async (req, res) => {
    const users = await User.find().sort({date: 'desc'});
    res.render('users/all-users', { users });
});

// init session and authenticate user
router.post('/users/signin', passport.authenticate('local', {
    successRedirect:'/modules',
    failureRedirect:'/users/signin',
    failureFlash: true
}));

// logout user
router.get('/users/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// register user
router.post('/users/signup', async (req, res) => {
    const {name, email, telephone, password, confirm_password } = req.body;

    const errors = [];
    if(name.length <= 0){
        errors.push({text:'Inserte nombre porfavor!'})
    }
    if(email.length <= 0){
        errors.push({text:'Inserte email porfavor!'})
    }
    if(telephone.length <= 0){
        errors.push({text:'Inserte numero telefonico porfavor!'})
    }

    if(password.length <= 0){
        errors.push({text:'Inserte password porfavor!'})
    }
    if(confirm_password.length <= 0){
        errors.push({text:'Confirme su password porfavor!'})
    }
    if(password != confirm_password){
        errors.push({text:'Contraseñas no coinciden!'});
    }
    if(password.length > 4){
        errors.push({text:'Contraseña debe ser menor que 4 caracteres!'})
    }

    if(errors.length > 0){
        res.render('users/signup', {
            errors,
            name,
            email,
            password,
            confirm_password
        });
    } else {
        const emailUser = await User.findOne({email: email});
        if(emailUser) {
            req.flash('error', 'El correo ya esta en uso, ingrese uno nuevo.');
            res.redirect('/users/signup');

        } else{
            try {
                let mailOptions = {
                    from: 'jmena0396@gmail.com',
                    to:email,
                    subject:'Pedidos don bosco',
                    text:`Bienvenido a nuestro sistema de pedidos ` + name
                };        
                const newUser =  new User({name, email, telephone, password, confirm_password});
                newUser.password = await newUser.encryptPassword(password);
                await newUser.save();
                await mailer.sendMail(mailOptions);
                req.flash('success_msg', 'Te has registrado exitosamente!');
                res.redirect('/users/signin');        
            }catch(err) {
                console.error(err);
            }
        }
    }

});

module.exports = router;