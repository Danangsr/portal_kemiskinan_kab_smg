var connection = require('../database').connection;
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , static = require('serve-static')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  ,  sha1 = require('sha1');

 var cek_login = require('./login').cek_login;
 var sql_enak = require('../database/mysql_enak.js').connection;

var dbgeo = require("dbgeo");
var multer = require("multer");

path.join(__dirname, '/foto')
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.use(cookieParser() );
  router.use(session({ secret: 'bhagasitukeren', cookie: { maxAge : 1200000 },saveUninitialized: true, resave: true }));
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
    cb(null, 'foto/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+'-'+file.originalname)
  }
})

var upload = multer({ storage: storage })

//start-------------------------------------
router.get('/', function(req, res) {
      connection.query("SELECT u.*,r.role  from user u left join role r on u.role = r.role_id where  u.deleted=0 ", function(err, rows, fields) {
          if (err) throw err;
          numRows = rows.length;
           res.render('content-backoffice/user/list',{data : rows});
        })
 
});

router.get('/insert', cek_login, function(req, res) {
    res.render('content-backoffice/user/insert');

       


});

router.get('/edit/:id', cek_login, function(req, res) {
  connection.query("select * from user where id_user='"+req.params.id+"'", function(err, rows, fields) {
    if (err) throw err;
     res.render('content-backoffice/user/edit', {data : rows});
    
  })


});

router.get('/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update user SET deleted=1 WHERE id_user='"+req.params.id+"' ", function(err, rows, fields) {
    if (err) throw err;
    numRows = rows.affectedRows;
  })
  res.redirect('/user');
});



router.post('/submit_insert', upload.array(), function(req, res){

  // baca name-namenya dari form
  // req.body.nameopo

  // senjata
  console.log(req.body)
  connection.query("insert into user (username, pwd, fullname, NIP, email, telp, is_admin) VALUES ('"+req.body.username+"', '"+sha1(req.body.pwd)+"', '"+req.body.fullname+"', '"+req.body.NIP+"', '"+req.body.email+"', '"+req.body.telp+"', '"+req.body.is_admin+"')", function(err, rows, fields) {
    if (err) throw err;
    numRows = rows.affectedRows;
  })
  res.redirect('/user');
})

router.post('/submit_edit', upload.array(),  function(req, res){

  // baca name-namenya dari form
  // req.body.nameopo
  
  // senjata
  //console.log(req.body)
  connection.query("update user SET username='"+req.body.username+"', pwd='"+sha1(req.body.pwd)+"', fullname='"+req.body.fullname+"', NIP='"+req.body.NIP+"', email='"+req.body.email+"', telp='"+req.body.telp+"', is_admin='"+req.body.is_admin+"' WHERE id_user='"+req.body.id_user+"' ", function(err, rows, fields) {
    if (err) throw err;
    numRows = rows.affectedRows;
  })
  res.redirect('/user/edit/'+req.body.id_user);
})
router.get('/data',async function(req, res) {
  let a = ' * '
  let str = ''
  if (req.query.kec) {
    a = 'DISTINCT a.id_kec ,a.wadmkc as kecamatan'
  }
  if (req.query.kel) {
    a = ' DISTINCT a.id_des_kel  ,a.wadmkd  as kelurahan '
    str += ' where a.id_kec ='+req.query.kel
  }
  let sql = `SELECT ${a} from admin_kab_smg a`+str
  
  await sql_enak.raw(sql).then(data=>{
    res.status(200).json({ data: data[0]})
 })
 .catch(err=>{
  console.log(err);

    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.post('/insert', upload.fields([{ name: 'foto_1', maxCount: 1 }, { name: 'foto_2', maxCount: 1 }]),async function(req, res) {

  let post = req.body
  post.pwd = sha1(post.pwd)
 if (req.files) {
  if (req.files['foto_1']) {
    var nama_file = req.files['foto_1'][0].filename;
    post['foto_1'] = nama_file;
  }

  if (req.files['foto_2']) {
    var nama_file = req.files['foto_2'][0].filename;
    post['foto_2'] = nama_file;
  }
}
await sql_enak.insert(post).into('user').then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
  console.log(err,'err');
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
});

router.post('/edit', upload.fields([{ name: 'foto_1', maxCount: 1 }, { name: 'foto_2', maxCount: 1 }]),async function(req, res) {
  let post = req.body
  console.log(post,'post');
if (post.pwd) {
  post.pwd = sha1(post.pwd)
}
  if (req.files) {
    if (req.files['foto_1']) {
      var nama_file = req.files['foto_1'][0].filename;
      post['foto_1'] = nama_file;
    }
  
    if (req.files['foto_2']) {
      var nama_file = req.files['foto_2'][0].filename;
      post['foto_2'] = nama_file;
    }
  }
  await sql_enak('user').where('id_user','=',post.id_user).update(post).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/hapus/:id',async function(req, res) {
  await sql_enak('user').where('id_user','=',req.params.id).update({deleted:1}).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.post('/list',async function (req,res) {
  let {role_id} = req.body
  let a = ''
  if(role_id){
    a = ' and r.role_id='+role_id
  }
  let role = await sql_enak.raw(`SELECT u.*,r.role  from user u left join role r on u.role = r.role_id where  u.deleted=0 `+a)

  res.json({data:role[0]})
})
router.get('/list',async function (req,res) {
  let a = ''
  if(req.query.role_id){
    a = ' and r.role_id='+req.query.role_id
  }
  let role = await sql_enak.raw(`SELECT u.*,r.role  from user u left join role r on u.role = r.role_id where  u.deleted=0 `+a)

  res.json({data:role[0]})
})
router.post('/role/list',async function (req,res) {
  let {role_id} = req.body
  let a = ''
  if(role_id){
    a = ' and r.role_id='+role_id
  }
  let role = await sql_enak.raw(`SELECT * FROM role r WHERE isnull(r.deletedAt ) `+a)
  res.json({role:role[0]})
})
router.post('/role/insert',cek_login,async function(req, res) {

  let post = req.body
  post.insertedAt = new Date()
  post.lastUpdateAt = new Date()
await sql_enak.insert(post).into('role').then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
  console.log(err,'err');
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
});

router.post('/role/edit',cek_login,async function(req, res) {
  let post = req.body
  console.log(post);
  post.lastUpdateAt = new Date()
  await sql_enak('role').where('role_id','=',post.role_id).update(post).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
  console.log(err);
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/role/hapus/:id',cek_login,async function(req, res) {
  await sql_enak('role').where('role_id','=',req.params.id).update({deletedAt:new Date()}).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
module.exports = router;
