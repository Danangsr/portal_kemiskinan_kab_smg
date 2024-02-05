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
router.post('/insert',async function(req, res) {

  let post = req.body
  post.insertedAt = new Date()
  post.lastUpdateAt = new Date()
await sql_enak.insert(post).into('log').then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
  console.log(err,'err');
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
});

router.post('/edit',async function(req, res) {
  let post = req.body
  post.lastUpdateAt = new Date()
  await sql_enak('log').where('log_id','=',post.log_id).update(post).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/hapus/:id',async function(req, res) {
  await sql_enak('log').where('log_id','=',req.params.id).update({deletedAt:new Date}).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.post('/list',async function(req, res) {
  let {log_id,count,limit,offset}  = req.body
  let value = [0]
  let str =' and p.log_id > ?'
  let a = `  *   `
  if (count) {
    a = ' count(*) as jml '
  }
 

  if (log_id) {
    str += ' and p.log_id = ?'
    value.push(log_id)
  }
  str+='  ORDER BY p.insertedAt DESC '
  if (limit) {
    str += ` limit ${limit}`
  }
  if (offset) {
    str += ` offset ${offset}`
  }
  let sql = `SELECT  ${a}  FROM log p  left join kabupaten k on k.kabupaten_id = p.kab_id  WHERE ISNULL(p.deletedAt) `+str
  
  await sql_enak.raw(sql,value).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
  console.log(err);
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/list',async function(req, res) {
  let value = [0]
  let str =' and p.log_id > ?'
  if (req.query.log_id) {
    str += ' and p.log_id = ?'
    value.push(req.query.log_id)
  }

  
  str+='  ORDER BY p.insertedAt DESC '
  if (req.query.limit) {
    str += ' limit ?'
    value.push(+req.query.limit)
  }
  if (req.query.offset) {
    str += ` offset ${req.query.offset}`
  }
  let sql = `SELECT *  FROM log p  left join kabupaten k on k.kabupaten_id = p.kab_id  WHERE ISNULL(p.deletedAt) `+str
  
  await sql_enak.raw(sql,value).then(data=>{
    res.status(200).json({ data: data[0]})
 })
 .catch(err=>{
  console.log(err);

    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})

module.exports = router;
