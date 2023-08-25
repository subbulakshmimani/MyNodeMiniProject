const MySQL = require('mysql');


const connection = MySQL.createConnection({
  host:'localhost',
  user:'root',
  password:'',
  database:'node_db'
});

connection.connect(function (err){
  if(err){
    console.log(err);
  }else{
    console.log('Connected successfully:)');
  }
})

module.exports = connection;