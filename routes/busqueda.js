var express = require('express');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Rutas

//===============================
// Búsqueda por colección
//===============================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    if (tabla === 'usuarios') {
        resultado = buscarUsuarios(busqueda, regex);

    } else if (tabla === 'hospitales') {
        resultado = buscarHospitales(busqueda, regex);
    } else if (tabla === 'medicos') {
        resultado = buscarMedicos(busqueda, regex);
    } else {
        return res.status(400).json({
            ok: false,
            mensaje: "No existe dicha colección "
        });
    }

    resultado.then(respuestas => {
        res.status(200).json({
            ok: true,
            mensaje: 'tabla: ' + tabla,
            [tabla]: respuestas
        });
    });

});

//================================
// Búsqueda genérica
//================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); //genera una expresión como la siguiente /busqueda/i

    Promise.all([ //Permite que se realice un arreglo de promesas y retorne los valores de las búsquedas
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then((respuestas) => {
            res.status(200).json({
                ok: true,
                mensaje: 'Petición realizada correctamente',
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        //return resolve('Hola');
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(medicos);
                }
            });
    });

}


function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        //return resolve('Hola');
        Usuario.find({}, 'nombre email')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios ', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}
module.exports = app;