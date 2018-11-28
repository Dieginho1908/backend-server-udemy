var express = require('express'); // servidor

var mdAutenticacion = require('../middlewares/autenticacion'); //middleware paravalidar token

var app = express();

var Usuario = require('../models/usuario'); //modelo usuario que define lo que vamos a crear y obtener
var Hospital = require('../models/hospital'); //modelo hospital que define lo que vamos a crear y obtener
var Medico = require('../models/medico'); //modelo medico que define lo que vamos a crear y obtener



//============================
// Obtener médicos
//============================
app.get('/', (req, res) => {
    var desde = req.query.desde;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al obtener médicos",
                    errors: err
                })
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    conteo: conteo
                });
            });


        });

});
//============================
// Actualizar médico
//============================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById({ _id: id }, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al actualizar Médico",
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe médico con ese id",
                errors: err
            })
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al intentar actualizar médico",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "Médico actualizado",
                medico: medico,
                usuariottoken: req.usuario
            });
        });
    });
});

//============================
// Crear médico
//============================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error a crear Médico",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: "Médico creado",
            medico: medicoGuardado,
            usuariottoken: req.usuario
        });
    });
});

//============================
// Eliminar médico
//============================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove({ _id: id }, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al intentar eliminar Médico",
                errors: err
            });
        }

        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No se encontró médico con ese id",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Médico eliminado",
            medico: medicoEliminado,
            usuariottoken: req.usuario
        });
    });
});

module.exports = app;