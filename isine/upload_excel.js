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
const importExcel = require("convert-excel-to-json");

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
function convert_date(y,s) {
	let y2 = y.split(s)
	let str = ''
	for (let i = y2.length-1; i >=0 ; i--) {
		if (i==0) {
			str+=y2[i]
		}else{
			str+=y2[i]+'-'
		}
	}
	return new Date(str)
}
let bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
function convert_date2(y) {
  console.log(y.split(' '));
	let y2 = y.split(' ')
  let bln = ''
  for (let i = 0; i < bulan.length; i++) {
    if (bulan[i] == y2[1]) {
      bln = i+1
    }
  }
	return `${y2[2]}-${bln.length==2?bln:'0'+bln}-${y2[0].length==2?y2[0]:'0'+y2[0]}`
}
router.post('/excel_kemiskinan', upload.fields([{ name: 'excel', maxCount: 1 }]), async function(req, res){
  try {
  if (req.files) {
    if (req.files['excel']) {
      let file = req.files.excel[0];
      let hasil = await importExcel({
        sourceFile: file.path,
        header: { rows: 3 },	
        columnToKey:{  B:"ID_keluarga_P3KE",C :"dimuktakhirkan_tahun", D:"provinsi", E:"kabupaten", F:"Id_kec", G:"kecamatan",H :"Id_des_kel", I:"kelurahan", J:"kode_kemdagri", K:"desil_kesejahteraan", L:"persentil",M :"alamat", N:"RT", O:"RW", P:"Koordinat_X",Q :"Koordinat_Y",R :"IDIndividu",S :"prioritas_verval",T :"nama",U:'nama_perbaikan', V:"NIK",W:'NIK_perbaikan', X:"nomor_KK", Y:"foto_KK", Z:"tanggal_lahir", AA:"padan_dukcapil",AB:"jenis_kelamin",AC :"hubungan_dengan_KK",AD :"status_kawin", AE:"pekerjaan", AF:"status_pekerjaan", AG:"pendidikan", AH:"umur", AI:"kelompok_umur"
        ,AJ :"penerima_BPNT",AK :"penerima_BPUM", AL:"penerima_BST", AM:"penerima_PKH", AN:"penerima_SEMBAKO", AO:"penerima_prakerja", AP:"penerima_KUR",AQ :"resiko_stunting",AR :"kepemilikan_rumah", AS:"memiliki_simpanan", AT:"jenis_atap",AU:'kualitas_atap', AV:"jenis_dinding", 
        AW:'kualitas_dinding',AX:"jenis_lantai", 
        AY:'kualitas_lantai',
        AZ:"sumber_penerangan",BA:'daya_listik_terpasang',
        BB :"bahan_bakar_memasak",BC :"sumber_air_minum", BD:"memiliki_fasilitas_buang_air_besar", BE:"foto_rumah_tampak_depan", BF:"foto_atap", BG:"foto_lantai", BH:"foto_dinding"
        , BI:"foto_jamban", BJ:"VERVAL_memenuhi_kriteria_P3KE", BK:"VERVAL_alasan_tidak_memenuhi_kriteria_P3KE", BL:"VERVAL_keterangan", BM:"VERVAL_keterangan_tambahan", BN:"DTKS_BERIRISAN_DTKS", BO:"DTKS_ID_DTKS", BP:"DTKS_KK_DTKS", BQ:"DTKS_keterangan_DTKS", BR:"SIKS_DJ_memiliki_rumah_layak_huni", BS:"SIKS_DJ_memiliki_akses_air_bersih", BT:"SIKS_DJ_memiliki_jamban", BU:"SIKS_DJ_memiliki_listrik_sendiri", BV:"SIKS_DJ_apakah_bekerja", BW:"SIKS_DJ_anak_tidak_sekolah", BX:"SIKS_DJ_berisiko_stunting", BY:"SIKS_DJ_disabilitas", BZ:"APBN_PKH", CA:"APBN_sembako", CB:"APBN_PIP", CC:"APBN_KIP", CD:"APBN_JKN_KIS", CE:"APBN_BSPS", CF:"APBD_beasiswa_miskin", CG:"APBD_serasi_kasih", CH:"APBD_yatim_piatu", CI:"APBD_alat_bantu_disabilitas", CJ:"APBD_RTLH_desa",
        CK:'RTLH_bantuan_kabupaten',
        CL:"APBD_RTLH_kelurahan",CM:  'BLT_DBHCHT',CN:'BLT_DID',
        CO:"APBD_BPJS_PBI", CP:"dana_desa_BLT_DD", CQ:"dana_desa_RTLH_desa", CR:"sumber_data", CS:"tahun_data", CT:"status_keberadaan_target", CU:"status_verifikasi",CV:'bansos_APBD_bantuan_jambanisasi',CW:'bansos_APBD_bantuan_akses_air_bersih',CX:'bansos_APBD_bantuan_jaringan_listrik',CY:'bansos_APBD_bantuan_padat_karya',CZ:'bansos_APBD_bantuan_pelatihan'},
        sheets: ["Sheet1"],
      });	
      let result = hasil["Sheet1"]

    sql_enak.transaction(function(tr) {
      return sql_enak.batchInsert('kemiskinan', result)
        .transacting(tr)
      })
      .then(function(ids) { console.log(ids);  res.status(200).send('Sukses'); /*...*/ })
      .catch(function(error) {console.log(error);  res.status(500).send('Internal Server Error');/*...*/ });
      // let arr = []
      // let pesan = 'Sukses'

//       for (let i = 0; i < result.length; i++) {    
//         if ( result[i]["tanggal_terbit_oss"]) {
//           result[i]["tanggal_terbit_oss"]=convert_date(result[i]["tanggal_terbit_oss"] ,'/')

//         }else{
//           result[i]["tanggal_terbit_oss"]= null
//         }
//         result[i]["insertedAt"]=new Date()
//         result[i]["lastUpdateAt"]=new Date()
//         await sql_enak.insert(result[i]).into("izin_proyek").then(function (hsl) {
//           arr.push(hsl[0])

//         }).catch(function (err) {
//           console.log(err);
//           i+=999999999
//           pesan = 'error, terjadi kesalahan upload'
//         })
//       }
//       if (pesan == 'Sukses') {
//         res.json(pesan)
//       }else{
//         for (let k = 0; k < arr.length; k++) {
//         await  sql_enak('izin_proyek').where('izin_proyek_id', arr[k]).del()
//         }
//         res.json(pesan)
//       }
//     }else{
//       res.json('file salah')
    }
}else{
  res.json('error')
}
  } catch (error) {
  console.log(error);
  // Handle the error appropriately
  res.status(500).send('Internal Server Error');
  }
})

module.exports = router;
