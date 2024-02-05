
/*
 * GET home page.
 */
// import database

 var mysql      = require('mysql');

module.exports.connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port	   : '3306',
  password : 'Grafika9',
  database : '2023_portal_kemiskinan_ungaran'
});
