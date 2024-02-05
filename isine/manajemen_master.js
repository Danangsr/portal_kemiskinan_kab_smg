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
// KATEGORI PILIHAN
router.get('/kategori_pilihan', cek_login, function(req, res) {
  connection.query("SELECT * from kategori_pilihan where deleted=0", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_kategori_pilihan/list',{data:rows}); 
  });
});

router.get('/kategori_pilihan/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_kategori_pilihan/insert'); 
});

router.get('/kategori_pilihan/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from kategori_pilihan where id='"+req.params.id+"'", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_kategori_pilihan/edit', {data:rows}); 
  });
});

router.post('/kategori_pilihan/submit_insert', cek_login, function(req, res){
  var post = {}
 post = req.body;
 
    console.log(post)
   sql_enak.insert(post).into("kategori_pilihan").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/kategori_pilihan'); 
});
});

router.post('/kategori_pilihan/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
 
    console.log(post)
   sql_enak("kategori_pilihan").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/kategori_pilihan'); 
});
});

router.get('/kategori_pilihan/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update kategori_pilihan SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/kategori_pilihan');
});

// PILIHAN
router.get('/pilihan', cek_login, function(req, res) {
  connection.query("SELECT a.*, b.kategori_pilihan from pilihan a left join kategori_pilihan b on a.kategori_pilihan=b.id where a.deleted=0;", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_pilihan/list', {data:rows}); 
  });
});

router.get('/pilihan/insert', cek_login, function(req, res) {
  connection.query("SELECT * from kategori_pilihan where deleted=0", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_pilihan/insert', {kategori:rows}); 
  });
});

router.get('/pilihan/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from pilihan where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from kategori_pilihan where deleted=0", function(err, rowss, fields) {
      res.render('content-backoffice/manajemen_pilihan/edit', {data:rows, kategori:rowss}); 
    });
  });
});

router.post('/pilihan/submit_insert', cek_login, function(req, res){
  var post = {}
 post = req.body;
 
    console.log(post)
   sql_enak.insert(post).into("pilihan").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/pilihan'); 
});
});

router.post('/pilihan/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
 
    console.log(post)
   sql_enak("pilihan").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/pilihan'); 
});
});

router.get('/pilihan/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update pilihan SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/pilihan');
});

// ROLE
router.get('/role', cek_login, function(req, res) {
  connection.query("SELECT * from role where isnull(deletedAt)", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_role/list', {data:rows}); 
  });
});

router.get('/role/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_role/insert'); 
});

router.get('/role/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from role where role_id='"+req.params.id+"'", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_role/edit', {data:rows}); 
  });
});

router.post('/role/submit_insert', cek_login, function(req, res){
  var post = {}
 post = req.body;
 
    console.log(post)
   sql_enak.insert(post).into("role").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/role'); 
});
});

router.post('/role/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
 
    console.log(post)
   sql_enak("role").where("role_id", req.body.role_id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/role'); 
});
});

router.get('/role/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update role SET deletedAt= CURRENT_DATE() WHERE role_id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/role');
});
router.get('/pilihan/list',async function (req,res) {
    let pilihan = await sql_enak.raw(`SELECT  * FROM  kategori_pilihan kp WHERE kp.deleted =0`)
    for (let i = 0; i < pilihan[0].length; i++) {
      let x = await sql_enak.raw(`SELECT  * FROM  pilihan p  WHERE p.deleted =0 and p.kategori_pilihan =`+pilihan[0][i].id)
      pilihan[0][i].pilihan = x[0]
    }
    res.json({pilihan:pilihan[0]})
})
// PRIVILEGE
router.get('/role/privilege/:id', cek_login, function(req, res) {
  connection.query("SELECT * from role where isnull(deletedAt) and role_id = "+req.params.id, function(err, data, fields) {
    res.render('content-backoffice/manajemen_privilege/privilege',{data}); 
  });
});
router.post('/get_kec',async function (req,res) {
  let data = await sql_enak.raw(`SELECT * FROM admin_kec p `)
  res.json({data:data[0]})
})
router.post('/get_kab/:id',async function (req,res) {
  let data = await sql_enak.raw(`SELECT * FROM admin_kab_smg p  WHERE p.id_kec =`+req.params.id)
  res.json({data:data[0]})
})
module.exports = router;
