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
var cek_login_depan = require('./login').cek_login_depan;
var cek_login_google = require('./login').cek_login_google;
var dbgeo = require("dbgeo");
var multer = require("multer");
var st = require('knex-postgis')(sql_enak);
path.join(__dirname, '/public/foto')
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

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
router.get('/',cek_login_depan, function(req, res) {
  res.render('content/dashboard_user',{user:req.user[0]}); 
});
router.get('/opd',cek_login_depan, function(req, res) {
  res.render('content/dashboard_user_opd',{user:req.user[0]}); 
});
router.get('/camat',cek_login_depan, function(req, res) {
  res.render('content/dashboard_user_camat',{user:req.user[0]}); 
});
router.get('/lurah',cek_login_depan, function(req, res) {
  res.render('content/dashboard_user_lurah',{user:req.user[0]}); 
});
router.get('/detail/:id',cek_login_depan,async function(req, res) {
  data = await sql_enak.raw(`SELECT *  FROM kemiskinan p   WHERE ISNULL(p.deletedAt)  and p.kemiskinan_id = `+req.params.id)

  res.render('content/detail',{data:data[0],user:req.user[0],id:req.params.id}); 
});
router.get('/verval/:id',cek_login_depan,async function(req, res) {
  let temp = await sql_enak.raw(`SELECT * FROM temp_kemiskinan tk WHERE tk.kemiskinan_id = `+req.params.id)
  let data=[[]]
  if (temp[0].length==0) {
     data = await sql_enak.raw(`SELECT *  FROM kemiskinan p   WHERE ISNULL(p.deletedAt)  and p.kemiskinan_id = `+req.params.id)

  }else{
    data = temp
  }
  let pilihan = await sql_enak.raw(`SELECT  * FROM  kategori_pilihan kp WHERE kp.deleted =0`)
  for (let i = 0; i < pilihan[0].length; i++) {
    let x = await sql_enak.raw(`SELECT  * FROM  pilihan p  WHERE p.deleted =0 and p.kategori_pilihan =`+pilihan[0][i].id)
    pilihan[0][i].pilihan = x[0]
  }
  let kec = await sql_enak.raw(`SELECT * FROM admin_kec p `)
  let kel = await sql_enak.raw(`SELECT * FROM admin_kab_smg p  WHERE p.id_kec =`+data[0][0].Id_kec)
    res.render('content/verifikasi_validasi',{data:data[0],kec:kec[0],kel:kel[0],user:req.user[0],pilihan:pilihan[0]}); 
});

module.exports = router;
