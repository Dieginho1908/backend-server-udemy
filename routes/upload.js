var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();


//middleware fileUpload
app.use(fileUpload());

//Models
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios']
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de busqueda no válida. Los tipos de colección válidos son ' + tiposValidos.join(', '),
            errors: { message: 'Tipo de busqueda no válida. Los tipos de colección válidos son ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //Onbtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión NO valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    //Nombre del archivo persoanalizado
    // idusuario-random.png

    var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    //mover el archivo del temporal a u npath específico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    suborPorTipo(tipo, id, nombreArchivo, res);

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
    });



    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Archivo movido',
    // });
});


function suborPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario No existe',
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {

                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico No existe',
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            //Validación de que si haya resultados

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital No existe'
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}


module.exports = app;