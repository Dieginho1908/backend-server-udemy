var express = require('express'); // servidor
var bcrypt = require('bcryptjs'); //Para encriptar contraseñas
var jwt = require('jsonwebtoken'); // generador de token

var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion'); //middleware para

var app = express();

var Usuario = require('../models/usuario'); //modelo usuario que define lo que vamos a crear y obtener
var Hospital = require('../models/hospital'); //modelo hospital que define lo que vamos a crear y obtener

app.get('/', (req, res) => {
    var desde = req.query.desde;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') // trae los datos de usuario de la persona que creo el hospital
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando hospitales',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        conteo: conteo
                    });
                });

            });


});

//===================
// Crear Hospital
// ===================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariottoken: req.usuario
        });

    });



});

// ==========================
// Actualizar hospital
// =========================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById({ _id: id }, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hopital con ese id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = body.usuario;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            //hospitalGuardado.password = " :) ";
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                usuariottoken: req.usuario
            });
        });


    });

    // res.status(201).json({
    //     ok: true,
    //     id: id,
    //     body: body,
    //     //usuariottoken: req.usuario   <-------------Aquí me quedé.. Validando el PUT
    // });
});

//==============
//Eliminar hopital por ID
//=============


app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado,
            mensaje: "Hospital borrado",
            usuariottoken: req.usuario
        });
    })
})

module.exports = app;