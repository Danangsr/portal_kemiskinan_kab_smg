var connection = require('../database').connection;
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , static = require('serve-static')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  ,  sha1 = require('sha1');
  var sql_enak = require('../database/mysql_enak.js').connection;
  var cek_login = require('./login').cek_login;
  var cek_login_google = require('./login').cek_login_google;
  var dbgeo = require("dbgeo");
  var multer = require("multer");
  var st = require('knex-postgis')(sql_enak);
  var deasync = require('deasync');
  path.join(__dirname, '/public/foto')
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  const XLSX = require('xlsx');
  const fs = require('fs');
  router.use(cookieParser() );
  router.use(passport.initialize());
  router.use(passport.session());
  router.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/foto/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+'-'+file.originalname)
  }
})

var upload = multer({ storage: storage })

//start-------------------------------------
router.get('/', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_kemiskinan/list'); 
});

router.get('/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_kemiskinan/insert'); 
});

router.get('/edit/:id', cek_login,async function(req, res) {
 let data = await sql_enak.raw(`SELECT *  FROM kemiskinan p   WHERE ISNULL(p.deletedAt)  and p.kemiskinan_id = `+req.params.id)
 let pilihan = await sql_enak.raw(`SELECT  * FROM  kategori_pilihan kp WHERE kp.deleted =0`)
 for (let i = 0; i < pilihan[0].length; i++) {
   let x = await sql_enak.raw(`SELECT  * FROM  pilihan p  WHERE p.deleted =0 and p.kategori_pilihan =`+pilihan[0][i].id)
   pilihan[0][i].pilihan = x[0]
 }
 let kec = await sql_enak.raw(`SELECT * FROM admin_kec p `)
 let kel = await sql_enak.raw(`SELECT * FROM admin_kab_smg p  WHERE p.id_kec =`+data[0][0].Id_kec)

  res.render('content-backoffice/manajemen_kemiskinan/edit',{data:data[0],kec:kec[0],kel:kel[0],user:req.user[0],pilihan:pilihan[0]}); 
});

router.get('/excel',cek_login,async function(req, res) {
  let value = [0]
  let str =' and p.kemiskinan_id > ?'
  if (req.query.kemiskinan_id) {
    str += ' and p.kemiskinan_id = ?'
    value.push(req.query.kemiskinan_id)
  }
  if (req.query.tahun_data) {
    str += ' and p.tahun_data = ?'
    value.push(req.query.tahun_data)
  }
  if (req.query.desil_kesejahteraan) {
    str += ' and p.desil_kesejahteraan = ?'
    value.push(req.query.desil_kesejahteraan)
  }
  if (req.query.VERVAL_memenuhi_kriteria_P3KE) {
    str += ' and p.VERVAL_memenuhi_kriteria_P3KE = ?'
    value.push(req.query.VERVAL_memenuhi_kriteria_P3KE)
  }
  if (req.query.padan_dukcapil) {
    str += ' and p.padan_dukcapil = ?'
    value.push(req.query.padan_dukcapil)
  }
  if (req.query.sk_bupati) {
    str += ` and p.padan_dukcapil = 'Padan' and p.VERVAL_memenuhi_kriteria_P3KE='Ya' `
  }
  if (req.query.Id_kec) {
    str += ' and p.Id_kec = ?'
    value.push(req.query.Id_kec)
  }
  if (req.query.Id_des_kel) {
    str += ' and p.Id_des_kel = ?'
    value.push(req.query.Id_des_kel)
  }
  if (req.query.status_verifikasi) {
    str += ' and p.status_verifikasi = ?'
    value.push(req.query.status_verifikasi)
  }
  if (req.user[0].role ==2 && req.user[0].is_admin ==0) {
    str += ` and p.Id_kec = ${req.user[0].id_kec}  `
 }
  if (req.user[0].role ==4 && req.user[0].is_admin ==0) {
    str += ` and p.Id_kec = ${req.user[0].id_kec} `
  }
  if (req.user[0].role ==5 && req.user[0].is_admin ==0) {
    str += `   and p.Id_des_kel = ${req.user[0].id_des_kel} `
  }
  
  str+='  ORDER BY p.insertedAt DESC '
  if (req.query.limit) {
    str += ' limit ?'
    value.push(+req.query.limit)
  }
  if (req.query.offset) {
    str += ` offset ${req.query.offset}`
  }

  let sql = `SELECT p.*,p.nama,p.kemiskinan_id,p.NIK,p.alamat,ak.wadmkc as kecamatan ,aks.wadmkd as kelurahan,p.tahun_data,p.status_verifikasi, (SELECT l.log from log l WHERE l.kemiskinan_id = p.kemiskinan_id order by l.log_id desc limit 1) as catatan  FROM kemiskinan p  left join admin_kab_smg aks on aks.id_des_kel = p.Id_des_kel left join admin_kec ak on ak.id = p.Id_kec  WHERE ISNULL(p.deletedAt) `+str
  await sql_enak.raw(sql,value).then(data=>{
    res.render('content-backoffice/manajemen_kemiskinan/excel',{data:data[0],user:req.user[0]}); 
  })
 .catch(err=>{
  console.log(err);
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
module.exports = router;
