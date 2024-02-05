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
const { group } = require('console');
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
const resizeOptimizeImages = require('resize-optimize-images');
const resize = (file) => {
  (async () => {
    // Set the options.
    const options = {
      images: ['./public/foto/' + file],
      quality: 20
    };

    // Run the module.
   await resizeOptimizeImages(options)
  })();
}
//start-------------------------------------
var foto = upload.fields([{ name: 'foto_lantai', maxCount: 1 }, { name: 'foto_dinding', maxCount: 1 }, { name: 'foto_jamban', maxCount: 1 },{ name: 'foto_KK', maxCount: 1 }, { name: 'foto_rumah_tampak_depan', maxCount: 1 }, { name: 'foto_atap', maxCount: 1 }])

router.post('/insert',cek_login, foto,async function(req, res) {

  let post = req.body

  post.insertedAt = new Date()
  post.lastUpdateAt = new Date()
 if (req.files) {
  if (req.files['foto_rumah_tampak_depan']) {
    var nama_file = req.files['foto_rumah_tampak_depan'][0].filename;
    post['foto_rumah_tampak_depan'] = nama_file;
    resize(nama_file)

  }

  if (req.files['foto_atap']) {
    var nama_file = req.files['foto_atap'][0].filename;
    post['foto_atap'] = nama_file;
    resize(nama_file)

  }
  if (req.files['foto_jamban']) {
    var nama_file = req.files['foto_jamban'][0].filename;
    post['foto_jamban'] = nama_file;
    resize(nama_file)

  }

  if (req.files['foto_KK']) {
    var nama_file = req.files['foto_KK'][0].filename;
    post['foto_KK'] = nama_file;
    resize(nama_file)

  }
  if (req.files['foto_lantai']) {
    var nama_file = req.files['foto_lantai'][0].filename;
    post['foto_lantai'] = nama_file;
    resize(nama_file)

  }

  if (req.files['foto_dinding']) {
    var nama_file = req.files['foto_dinding'][0].filename;
    post['foto_dinding'] = nama_file;
    resize(nama_file)

  }
}
await sql_enak.insert(post).into('kemiskinan').then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
  console.log(err,'err');
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
});

router.post('/edit',cek_login, foto,async function(req, res) {
  let post = req.body
  post.lastUpdateAt = new Date()
  if (req.files) {
    if (req.files['foto_rumah_tampak_depan']) {
      var nama_file = req.files['foto_rumah_tampak_depan'][0].filename;
      post['foto_rumah_tampak_depan'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_atap']) {
      var nama_file = req.files['foto_atap'][0].filename;
      post['foto_atap'] = nama_file;
      resize(nama_file)
  
    }
    if (req.files['foto_jamban']) {
      var nama_file = req.files['foto_jamban'][0].filename;
      post['foto_jamban'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_KK']) {
      var nama_file = req.files['foto_KK'][0].filename;
      post['foto_KK'] = nama_file;
      resize(nama_file)
  
    }
    if (req.files['foto_lantai']) {
      var nama_file = req.files['foto_lantai'][0].filename;
      post['foto_lantai'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_dinding']) {
      var nama_file = req.files['foto_dinding'][0].filename;
      post['foto_dinding'] = nama_file;
      resize(nama_file)
  
    }
  }
  await sql_enak('kemiskinan').where('kemiskinan_id','=',post.kemiskinan_id).update(post).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/hapus/:id',cek_login,async function(req, res) {
  await sql_enak('kemiskinan').where('kemiskinan_id','=',req.params.id).update({deletedAt:new Date}).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.post('/jml_kk',async function (req,res) {
  let {desil_kesejahteraan ,tahun_data,Id_kec, Id_des_kel,padan_dukcapil,VERVAL_memenuhi_kriteria_P3KE} = req.body
  let value = [0]
  let str = ''
  if(padan_dukcapil){
    str +=` and p.padan_dukcapil = ?`
    value.push(padan_dukcapil)

  }
  if(VERVAL_memenuhi_kriteria_P3KE){
    str +=` and p.VERVAL_memenuhi_kriteria_P3KE = ?`
    value.push(VERVAL_memenuhi_kriteria_P3KE)

  }
  if(desil_kesejahteraan){
    str +=` and p.desil_kesejahteraan = ?`
    value.push(desil_kesejahteraan)

  }
  if (tahun_data) {
    str += ' and p.tahun_data = ?'
    value.push(tahun_data)
  }
  if (Id_kec) {
    str += ' and p.Id_kec = ?'
    value.push(Id_kec)
  }
  if (Id_des_kel) {
    str += ' and p.Id_des_kel = ?'
    value.push(Id_des_kel)
  }
  let sql = `SELECT COUNT(*) AS total_kk
  FROM (SELECT ID_keluarga_P3KE
        FROM kemiskinan p WHERE p.kemiskinan_id>? ${str}
        GROUP BY ID_keluarga_P3KE) AS t;`
        await sql_enak.raw(sql,value).then(data=>{
          res.status(200).json({ status: 200, message: "sukses", data: data[0]})
       })
       .catch(err=>{
        console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err})
       })

})
router.post('/cari',async function(req, res) {
  let {kemiskinan_id,wadmkc,wadmkd, ID_keluarga_P3KE, dimuktakhirkan_tahun, provinsi, kabupaten, Id_kec, kecamatan, Id_des_kel, kelurahan, persentil, kode_kemdagri, desil_kesejahteraan, alamat, RT, RW, Koordinat_X, Koordinat_Y, IDIndividu, nama, prioritas_verval, NIK, nomor_KK, foto_KK, padan_dukcapil, jenis_kelamin, hubungan_dengan_KK, tanggal_lahir, umur, kelompok_umur, status_kawin, pekerjaan, pendidikan, usia_dibawah_7_tahun, usia_antara_7_12, usia_antara_13_15, usia_antara_16_18, usia_antara_19_21, usia_antara_22_59, usia_diatas_60, penerima_BPNT, penerima_BPUM, penerima_BST, penerima_PKH, penerima_SEMBAKO, penerima_prakerja, penerima_KUR, resiko_stunting, kepemilikan_rumah, memiliki_simpanan, jenis_atap, jenis_dinding, jenis_lantai, sumber_penerangan, bahan_bakar_memasak, sumber_air_minum, memiliki_fasilitas_buang_air_besar, foto_rumah_tampak_depan, foto_atap, foto_lantai, foto_dinding, foto_jamban, VERVAL_memenuhi_kriteria_P3KE, VERVAL_alasan_tidak_memenuhi_kriteria_P3KE, VERVAL_keterangan, VERVAL_keterangan_tambahan, DTKS_BERIRISAN_DTKS, DTKS_ID_DTKS, DTKS_KK_DTKS, DTKS_keterangan_DTKS, SIKS_DJ_memiliki_rumah_layak_huni, SIKS_DJ_memiliki_akses_air_bersih, SIKS_DJ_memiliki_jamban, SIKS_DJ_memiliki_listrik_sendiri, SIKS_DJ_apakah_bekerja, SIKS_DJ_anak_tidak_sekolah, SIKS_DJ_berisiko_stunting, SIKS_DJ_disabilitas, APBN_PKH, APBN_sembako, APBN_PIP, APBN_KIP, APBN_JKN_KIS, APBN_BSPS, APBD_beasiswa_miskin, APBD_serasi_kasih, APBD_yatim_piatu, APBD_alat_bantu_disabilitas, APBD_RTLH_desa, APBD_RTLH_kelurahan, APBD_BPJS_PBI, dana_desa_BLT_DD, dana_desa_RTLH_desa, sumber_data, tahun_data, status_keberadaan_target, status_verifikasi, insertedAt, lastUpdateAt, deletedAt, status_pekerjaan, nama_perbaikan, NIK_perbaikan, kualitas_atap, kualitas_dinding, kualitas_lantai, daya_listik_terpasang, RTLH_bantuan_kabupaten, BLT_DBHCHT, BLT_DID, bansos_APBD_bantuan_jambanisasi, bansos_APBD_bantuan_akses_air_bersih, bansos_APBD_bantuan_jaringan_listrik, bansos_APBD_bantuan_padat_karya, bansos_APBD_bantuan_pelatihan,count,limit,offset,group}  = req.body
  let value = [0]
  let str =' and p.kemiskinan_id > ?'
  let a = `  *   `
  if (count) {
    a = ' count(*) as jml '
  }
  
  if (padan_dukcapil) {
    str += ' and p.padan_dukcapil = ?'
    value.push(padan_dukcapil)
  }
  if (VERVAL_memenuhi_kriteria_P3KE) {
    str += ' and p.VERVAL_memenuhi_kriteria_P3KE = ?'
    value.push(VERVAL_memenuhi_kriteria_P3KE)
  }
  if (bansos_APBD_bantuan_jambanisasi) {
    str += ' and p.bansos_APBD_bantuan_jambanisasi = ?'
    value.push(bansos_APBD_bantuan_jambanisasi)
  }
  if (bansos_APBD_bantuan_akses_air_bersih) {
    str += ' and p.bansos_APBD_bantuan_akses_air_bersih = ?'
    value.push(bansos_APBD_bantuan_akses_air_bersih)
  }
  if (bansos_APBD_bantuan_jaringan_listrik) {
    str += ' and p.bansos_APBD_bantuan_jaringan_listrik = ?'
    value.push(bansos_APBD_bantuan_jaringan_listrik)
  }
  if (bansos_APBD_bantuan_padat_karya) {
    str += ' and p.bansos_APBD_bantuan_padat_karya = ?'
    value.push(bansos_APBD_bantuan_padat_karya)
  }
  if (bansos_APBD_bantuan_pelatihan) {
    str += ' and p.bansos_APBD_bantuan_pelatihan = ?'
    value.push(bansos_APBD_bantuan_pelatihan)
  }


  if (dana_desa_BLT_DD) {
    str += ' and p.dana_desa_BLT_DD = ?'
    value.push(dana_desa_BLT_DD)
  }
  if (dana_desa_RTLH_desa) {
    str += ' and p.dana_desa_RTLH_desa = ?'
    value.push(dana_desa_RTLH_desa)
  }

  if (APBD_beasiswa_miskin) {
    str += ' and p.APBD_beasiswa_miskin = ?'
    value.push(APBD_beasiswa_miskin)
  }

  if (APBD_serasi_kasih) {
    str += ' and p.APBD_serasi_kasih = ?'
    value.push(APBD_serasi_kasih)
  }
  if (APBD_yatim_piatu) {
    str += ' and p.APBD_yatim_piatu = ?'
    value.push(APBD_yatim_piatu)
  }
  if (APBD_alat_bantu_disabilitas) {
    str += ' and p.APBD_alat_bantu_disabilitas = ?'
    value.push(APBD_alat_bantu_disabilitas)
  }
  if (APBD_RTLH_desa) {
    str += ' and p.APBD_RTLH_desa = ?'
    value.push(APBD_RTLH_desa)
  }
  if (APBD_RTLH_kelurahan) {
    str += ' and p.APBD_RTLH_kelurahan = ?'
    value.push(APBD_RTLH_kelurahan)
  }

  if (RTLH_bantuan_kabupaten) {
    str += ' and p.RTLH_bantuan_kabupaten = ?'
    value.push(RTLH_bantuan_kabupaten)
  }
  if (BLT_DBHCHT) {
    str += ' and p.BLT_DBHCHT = ?'
    value.push(BLT_DBHCHT)
  }
  if (BLT_DID) {
    str += ' and p.BLT_DID = ?'
    value.push(BLT_DID)
  }
  if (APBD_BPJS_PBI) {
    str += ' and p.APBD_BPJS_PBI = ?'
    value.push(APBD_BPJS_PBI)
  }
  if (tahun_data) {
    str += ' and p.tahun_data = ?'
    value.push(tahun_data)
  }
  if (Id_kec) {
    str += ' and p.Id_kec = ?'
    value.push(Id_kec)
  }
  if (Id_des_kel) {
    str += ' and p.Id_des_kel = ?'
    value.push(Id_des_kel)
  }
  if (status_verifikasi) {
    str += ' and p.status_verifikasi = ?'
    value.push(status_verifikasi)
  }
  if (desil_kesejahteraan) {
    str += ' and p.desil_kesejahteraan = ?'
    value.push(desil_kesejahteraan)
  }
  if (jenis_kelamin) {
    str += ' and p.jenis_kelamin = ?'
    value.push(jenis_kelamin)
  }
  if (SIKS_DJ_memiliki_rumah_layak_huni) {
    str += ' and p.SIKS_DJ_memiliki_rumah_layak_huni = ?'
    value.push(SIKS_DJ_memiliki_rumah_layak_huni)
  }
  if (SIKS_DJ_memiliki_akses_air_bersih) {
    str += ' and p.SIKS_DJ_memiliki_akses_air_bersih = ?'
    value.push(SIKS_DJ_memiliki_akses_air_bersih)
  }
  if (SIKS_DJ_memiliki_jamban) {
    str += ' and p.SIKS_DJ_memiliki_jamban = ?'
    value.push(SIKS_DJ_memiliki_jamban)
  }
  if (SIKS_DJ_memiliki_listrik_sendiri) {
    str += ' and p.SIKS_DJ_memiliki_listrik_sendiri = ?'
    value.push(SIKS_DJ_memiliki_listrik_sendiri)
  }
  if (SIKS_DJ_apakah_bekerja) {
    str += ' and p.SIKS_DJ_apakah_bekerja = ?'
    value.push(SIKS_DJ_apakah_bekerja)
  }
  if (SIKS_DJ_anak_tidak_sekolah) {
    str += ' and p.SIKS_DJ_anak_tidak_sekolah = ?'
    value.push(SIKS_DJ_anak_tidak_sekolah)
  }
  if (SIKS_DJ_berisiko_stunting) {
    str += ' and p.SIKS_DJ_berisiko_stunting = ?'
    value.push(SIKS_DJ_berisiko_stunting)
  }
  if (SIKS_DJ_disabilitas) {
    str += ' and p.SIKS_DJ_disabilitas = ?'
    value.push(SIKS_DJ_disabilitas)
  }
  if (APBN_PKH) {
    str += ' and p.APBN_PKH = ?'
    value.push(APBN_PKH)
  }
  if (APBN_sembako) {
    str += ' and p.APBN_sembako = ?'
    value.push(APBN_sembako)
  }
  if (APBN_PIP) {
    str += ' and p.APBN_PIP = ?'
    value.push(APBN_PIP)
  }
  if (APBN_KIP) {
    str += ' and p.APBN_KIP = ?'
    value.push(APBN_KIP)
  }
  if (APBN_JKN_KIS) {
    str += ' and p.APBN_JKN_KIS = ?'
    value.push(APBN_JKN_KIS)
  }
  if (APBN_BSPS) {
    str += ' and p.APBN_BSPS = ?'
    value.push(APBN_BSPS)
  }

  if (hubungan_dengan_KK) {
    str += ' and p.hubungan_dengan_KK = ?'
    value.push(hubungan_dengan_KK)
  }
  if (pekerjaan) {
    if (pekerjaan!='Lainnya') {
      str += ' and p.pekerjaan = ?'
      value.push(pekerjaan)
    }else{
      str += " and p.pekerjaan !='Petani'  and p.pekerjaan !='Pegawai Swasta'  and p.pekerjaan !='Nelayan' "
    }

  }
  
  if (penerima_BPNT) {
    str += ' and p.penerima_BPNT = ?'
    value.push(penerima_BPNT)
  }

  if (penerima_BPUM) {
    str += ' and p.penerima_BPUM = ?'
    value.push(penerima_BPUM)
  }

  if (penerima_BST) {
    str += ' and p.penerima_BST = ?'
    value.push(penerima_BST)
  }

  if (penerima_PKH) {
    str += ' and p.penerima_PKH = ?'
    value.push(penerima_PKH)
  }
  if (penerima_SEMBAKO) {
    str += ' and p.penerima_SEMBAKO = ?'
    value.push(penerima_SEMBAKO)
  }
  if (penerima_prakerja) {
    str += ' and p.penerima_prakerja = ?'
    value.push(penerima_prakerja)
  }

  if (kemiskinan_id) {
    str += ' and p.kemiskinan_id = ?'
    value.push(kemiskinan_id)
  }
  if (wadmkc) {
    str += ' and ak.wadmkc = ?'
    value.push(wadmkc)
  }
  if (wadmkd) {
    str += ' and aks.wadmkd = ?'
    value.push(wadmkd)
  }
  if (!group) {

  str+='  ORDER BY p.insertedAt DESC '
  if (limit) {
    str += ` limit ${limit}`
  }
  if (offset) {
    str += ` offset ${offset}`
  }
  }

  if (group) {
    if (group!='kecamatan' && group!='kelurahan') {
      a = ' count(*) as y , p.'+group+' as label '
      str += ' group by p.'+group
    }else if (group=='kecamatan' ){
      a = ' count(*) as y , ak.wadmkc as label '
      str += ' group by ak.wadmkc'
    }else if (group=='kelurahan' ){
      a = ' count(*) as y , aks.wadmkd as label '
      str += ' group by aks.wadmkd'
    }

  }
  let sql = `SELECT  ${a}  FROM kemiskinan p  left join admin_kec ak   on ak.id = p.Id_kec left join admin_kab_smg aks on p.id_des_kel = aks.id_des_kel    WHERE ISNULL(p.deletedAt) `+str
  await sql_enak.raw(sql,value).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
  console.log(err);
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.post('/list',cek_login,async function(req, res) {
  let {kemiskinan_id,wadmkc,wadmkd, ID_keluarga_P3KE, dimuktakhirkan_tahun, provinsi, kabupaten, Id_kec, kecamatan, Id_des_kel, kelurahan, persentil, kode_kemdagri, desil_kesejahteraan, alamat, RT, RW, Koordinat_X, Koordinat_Y, IDIndividu, nama, prioritas_verval, NIK, nomor_KK, foto_KK, padan_dukcapil, jenis_kelamin, hubungan_dengan_KK, tanggal_lahir, umur, kelompok_umur, status_kawin, pekerjaan, pendidikan, usia_dibawah_7_tahun, usia_antara_7_12, usia_antara_13_15, usia_antara_16_18, usia_antara_19_21, usia_antara_22_59, usia_diatas_60, penerima_BPNT, penerima_BPUM, penerima_BST, penerima_PKH, penerima_SEMBAKO, penerima_prakerja, penerima_KUR, resiko_stunting, kepemilikan_rumah, memiliki_simpanan, jenis_atap, jenis_dinding, jenis_lantai, sumber_penerangan, bahan_bakar_memasak, sumber_air_minum, memiliki_fasilitas_buang_air_besar, foto_rumah_tampak_depan, foto_atap, foto_lantai, foto_dinding, foto_jamban, VERVAL_memenuhi_kriteria_P3KE, VERVAL_alasan_tidak_memenuhi_kriteria_P3KE, VERVAL_keterangan, VERVAL_keterangan_tambahan, DTKS_BERIRISAN_DTKS, DTKS_ID_DTKS, DTKS_KK_DTKS, DTKS_keterangan_DTKS, SIKS_DJ_memiliki_rumah_layak_huni, SIKS_DJ_memiliki_akses_air_bersih, SIKS_DJ_memiliki_jamban, SIKS_DJ_memiliki_listrik_sendiri, SIKS_DJ_apakah_bekerja, SIKS_DJ_anak_tidak_sekolah, SIKS_DJ_berisiko_stunting, SIKS_DJ_disabilitas, APBN_PKH, APBN_sembako, APBN_PIP, APBN_KIP, APBN_JKN_KIS, APBN_BSPS, APBD_beasiswa_miskin, APBD_serasi_kasih, APBD_yatim_piatu, APBD_alat_bantu_disabilitas, APBD_RTLH_desa, APBD_RTLH_kelurahan, APBD_BPJS_PBI, dana_desa_BLT_DD, dana_desa_RTLH_desa, sumber_data, tahun_data, status_keberadaan_target, status_verifikasi, insertedAt, lastUpdateAt, deletedAt, status_pekerjaan, nama_perbaikan, NIK_perbaikan, kualitas_atap, kualitas_dinding, kualitas_lantai, daya_listik_terpasang, RTLH_bantuan_kabupaten, BLT_DBHCHT, BLT_DID, bansos_APBD_bantuan_jambanisasi, bansos_APBD_bantuan_akses_air_bersih, bansos_APBD_bantuan_jaringan_listrik, bansos_APBD_bantuan_padat_karya, bansos_APBD_bantuan_pelatihan,count,limit,offset,group}  = req.body
  let value = [0]
  let str =' and p.kemiskinan_id > ?'
  let a = `  *   `
  if (count) {
    a = ' count(*) as jml '
  }
  if (Id_kec) {
    str += ' and p.Id_kec = ?'
    value.push(Id_kec)
  }
  if (tahun_data) {
    str += ' and p.tahun_data = ?'
    value.push(tahun_data)
  }
  if (Id_des_kel) {
    str += ' and p.Id_des_kel = ?'
    value.push(Id_des_kel)
  }

  if (penerima_BPNT) {
    str += ' and p.penerima_BPNT = ?'
    value.push(penerima_BPNT)
  }

  if (penerima_BPUM) {
    str += ' and p.penerima_BPUM = ?'
    value.push(penerima_BPUM)
  }

  if (penerima_BST) {
    str += ' and p.penerima_BST = ?'
    value.push(penerima_BST)
  }

  if (penerima_PKH) {
    str += ' and p.penerima_PKH = ?'
    value.push(penerima_PKH)
  }
  if (penerima_SEMBAKO) {
    str += ' and p.penerima_SEMBAKO = ?'
    value.push(penerima_SEMBAKO)
  }
  if (penerima_prakerja) {
    str += ' and p.penerima_prakerja = ?'
    value.push(penerima_prakerja)
  }

  if (desil_kesejahteraan) {
    str += ' and p.desil_kesejahteraan = ?'
    value.push(desil_kesejahteraan)
  }
  if (jenis_kelamin) {
    str += ' and p.jenis_kelamin = ?'
    value.push(jenis_kelamin)
  }
 if (req.user[0].role ==2 && req.user[0].is_admin ==0) {
    str += ` and p.id_kec = ${req.user[0].id_kec} and  p.id_des_kel = ${req.user[0].id_des_kel} `
 }
  if (req.user[0].role ==4 && req.user[0].is_admin ==0) {
    str += ` and p.id_kec = ${req.user[0].id_kec} `
  }
  if (req.user[0].role ==5 && req.user[0].is_admin ==0) {
    str += `   and p.id_des_kel = ${req.user[0].id_des_kel} `
  }
  if (kemiskinan_id) {
    str += ' and p.kemiskinan_id = ?'
    value.push(kemiskinan_id)
  }
  if (!group) {
    str+='  ORDER BY p.insertedAt DESC '
    if (limit) {
      str += ` limit ${limit}`
    }
    if (offset) {
      str += ` offset ${offset}`
    }
  }

  if (group) {
    a = ' count(*) as y , p.'+group+' as label '
    str += ' group by p.'+group
  }
  let sql = `SELECT  ${a}  FROM kemiskinan p   left join admin_kab_smg aks on aks.id_des_kel = p.Id_des_kel left join admin_kec ak on ak.id = p.Id_kec WHERE ISNULL(p.deletedAt) `+str
  await sql_enak.raw(sql,value).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
  console.log(err);
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/list',cek_login,async function(req, res) {
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

  let sql = `SELECT p.nomor_KK,p.ID_keluarga_P3KE,p.nama,p.kemiskinan_id,p.NIK,p.alamat,ak.wadmkc as kecamatan ,aks.wadmkd as kelurahan,p.tahun_data,p.status_verifikasi, (SELECT l.log from log l WHERE l.kemiskinan_id = p.kemiskinan_id order by l.log_id desc limit 1) as catatan  FROM kemiskinan p  left join admin_kab_smg aks on aks.id_des_kel = p.Id_des_kel left join admin_kec ak on ak.id = p.Id_kec  WHERE ISNULL(p.deletedAt) `+str
  await sql_enak.raw(sql,value).then(data=>{
    res.status(200).json({ data: data[0]})
 })
 .catch(err=>{
  console.log(err);

    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.post('/temp/insert',cek_login, foto,async function(req, res) {

  let post = req.body

  post.insertedAt = new Date()
  post.lastUpdateAt = new Date()
  if (req.files) {
    if (req.files['foto_rumah_tampak_depan']) {
      var nama_file = req.files['foto_rumah_tampak_depan'][0].filename;
      post['foto_rumah_tampak_depan'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_atap']) {
      var nama_file = req.files['foto_atap'][0].filename;
      post['foto_atap'] = nama_file;
      resize(nama_file)
  
    }
    if (req.files['foto_jamban']) {
      var nama_file = req.files['foto_jamban'][0].filename;
      post['foto_jamban'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_KK']) {
      var nama_file = req.files['foto_KK'][0].filename;
      post['foto_KK'] = nama_file;
      resize(nama_file)
  
    }
    if (req.files['foto_lantai']) {
      var nama_file = req.files['foto_lantai'][0].filename;
      post['foto_lantai'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_dinding']) {
      var nama_file = req.files['foto_dinding'][0].filename;
      post['foto_dinding'] = nama_file;
      resize(nama_file)
  
    }
  }
await sql_enak.insert(post).into('temp_kemiskinan').then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
  console.log(err,'err');
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
});

router.post('/temp/edit',cek_login, foto,async function(req, res) {
  let post = req.body
  post.lastUpdateAt = new Date()
  if (req.files) {
    if (req.files['foto_rumah_tampak_depan']) {
      var nama_file = req.files['foto_rumah_tampak_depan'][0].filename;
      post['foto_rumah_tampak_depan'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_atap']) {
      var nama_file = req.files['foto_atap'][0].filename;
      post['foto_atap'] = nama_file;
      resize(nama_file)
  
    }
    if (req.files['foto_jamban']) {
      var nama_file = req.files['foto_jamban'][0].filename;
      post['foto_jamban'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_KK']) {
      var nama_file = req.files['foto_KK'][0].filename;
      post['foto_KK'] = nama_file;
      resize(nama_file)
  
    }
    if (req.files['foto_lantai']) {
      var nama_file = req.files['foto_lantai'][0].filename;
      post['foto_lantai'] = nama_file;
      resize(nama_file)
  
    }
  
    if (req.files['foto_dinding']) {
      var nama_file = req.files['foto_dinding'][0].filename;
      post['foto_dinding'] = nama_file;
      resize(nama_file)
  
    }
  }
  await sql_enak('temp_kemiskinan').where('temp_kemiskinan_id','=',post.temp_kemiskinan_id).update(post).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/temp/hapus/:id',cek_login,async function(req, res) {
  await sql_enak('temp_kemiskinan').where('kemiskinan_id','=',req.params.id).del().then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.post('/temp/list',cek_login,async function(req, res) {
  let {temp_kemiskinan_id,count,limit,offset,kemiskinan_id}  = req.body
  let value = [0]
  let str =' and p.temp_kemiskinan_id > ?'
  let a = `  *   `
  if (count) {
    a = ' count(*) as jml '
  }
//  if (req.user[0].role ==1 && req.user[0].is_admin ==0) {
//     str += ` and p.id_kec = ${req.user[0].id_kec} and  p.id_des_kel = ${req.user[0].id_des_kel} `
//  }
//   if (req.user[0].role ==3 && req.user[0].is_admin ==0) {
//     str += ` and p.id_kec = ${req.user[0].id_kec} `
//   }
//   if (req.user[0].role ==4 && req.user[0].is_admin ==0) {
//     str += `   and p.id_des_kel = ${req.user[0].id_des_kel} `
//   }
  if (temp_kemiskinan_id) {
    str += ' and p.temp_kemiskinan_id = ?'
    value.push(temp_kemiskinan_id)
  }
  if (kemiskinan_id) {
    str += ' and p.kemiskinan_id = ?'
    value.push(kemiskinan_id)
  }
  str+='  ORDER BY p.insertedAt DESC '
  if (limit) {
    str += ` limit ${limit}`
  }
  if (offset) {
    str += ` offset ${offset}`
  }
  let sql = `SELECT  ${a}  FROM temp_kemiskinan p   WHERE ISNULL(p.deletedAt) `+str
  await sql_enak.raw(sql,value).then(data=>{
    res.status(200).json({ status: 200, message: "sukses", data: data[0]})
 })
 .catch(err=>{
  console.log(err);
    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
router.get('/temp/list',cek_login,async function(req, res) {
  let value = [0]
  let str =' and p.temp_kemiskinan_id > ?'
  if (req.query.temp_kemiskinan_id) {
    str += ' and p.temp_kemiskinan_id = ?'
    value.push(req.query.temp_kemiskinan_id)
  }
  if (req.query.kemiskinan_id) {
    str += ' and p.kemiskinan_id = ?'
    value.push(req.query.kemiskinan_id)
  }
//   if (req.user[0].role ==1 && req.user[0].is_admin ==0) {
//     str += ` and p.id_kec = ${req.user[0].id_kec} and  p.id_des_kel = ${req.user[0].id_des_kel} `
//  }
//   if (req.user[0].role ==3 && req.user[0].is_admin ==0) {
//     str += ` and p.id_kec = ${req.user[0].id_kec} `
//   }
//   if (req.user[0].role ==4 && req.user[0].is_admin ==0) {
//     str += `   and p.id_des_kel = ${req.user[0].id_des_kel} `
//   }
  
  str+='  ORDER BY p.insertedAt DESC '
  if (req.query.limit) {
    str += ' limit ?'
    value.push(+req.query.limit)
  }
  if (req.query.offset) {
    str += ` offset ${req.query.offset}`
  }
  let sql = `SELECT *  FROM temp_kemiskinan p   WHERE ISNULL(p.deletedAt) `+str
  await sql_enak.raw(sql,value).then(data=>{
    res.status(200).json({ data: data[0]})
 })
 .catch(err=>{
  console.log(err);

    res.status(500).json({ status: 500, message: "gagal", data: err})
 })
})
module.exports = router;
