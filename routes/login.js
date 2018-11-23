var express = require('express'); // servidor
var bcrypt = require('bcryptjs'); //Para encriptar contraseñas
var jwt = require('jsonwebtoken'); // generador de token

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario'); //modelo usuario que define lo que vamos a crear y obtener


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) { // si existe un error retorna 500
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la conexión',
                errors: err
            });
        }

        if (!usuarioDB) { // si no encuentra usuario en la bdd por email retorna 400
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con las credenciales proporcionadas - email',
                errors: { message: 'No existe usuario con las credenciales proporcionadas - email' }
            });
        }


        if (!bcrypt.compareSync(body.password, usuarioDB.password)) { // si el password no coincide retorna 400
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con las credenciales proporcionadas - password',
                errors: { message: 'No existe usuario con las credenciales proporcionadas - password' }
            });
        }

        // Crear token
        usuarioDB.password = ":)" //para que no se muestre la contrasña en el token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

        //datos que se reciben, SEED (Clave para decodificar), tiempo de expiración de token


        res.status(200).json({ // si pasó todo lo anterior retorna 200 y los datos del usuario
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        });
    });




});


module.exports = app;