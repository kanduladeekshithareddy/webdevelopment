const mysql = require("mysql");
const express = require ("express");
const ejs = require('ejs');
const nodemailer = require('nodemailer');
// const fs = require('fs');

// const multer = require('multer');

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

const bodyparser =require("body-parser");
const encoder =bodyparser.urlencoded();

const app = express();
app.set('view engine', 'ejs');
var username;
app.use(bodyparser.json());
var password;
var roll;
var mentid;
app.use('/assets',express.static('assets'));//for css
var key;
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"20072004",
    database:"minipro"
});
//connect to the database

connection.connect(function(error){
    if (error) throw error
    else console.log("connected to server database successfully")
});

app.get("/",function(req,res){
    res.sendFile(__dirname+'/home.html');
})
app.post("/",encoder,function(req,res){
     username =req.body.username;
    //  console.log(username);
     password=req.body.pass;
    connection.query("select * from login where username = ? and pass = ?",[username,password],function(error,results,fields){
        if(results.length >0){
            res.redirect('/welcome');
        }
        else{
            res.redirect('/');
            console.log("do not happen");
        }
        res.end();
    })
})
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:'deekshithareddykandula@gmail.com',
    pass:'20072004@d'
  }
});

app.get('/welcome', (req, res) => {
    var uname=username;
    // console.log(uname);
    const query = "SELECT *FROM login u INNER JOIN profile p ON u.userid = p.userid inner JOIN branch b ON p.bid = b.bid where u.username=?";
    connection.query(query,[uname] ,(err, results) => {
      if (err) throw err;
      key = results[0].bid;
      roll=results[0].rollnumber;
      res.render('welcome.ejs', { data: results });
      // console.log(key);
    });
  });

app.get('/acedemics', function(req, res) {
    const sql = 'SELECT * FROM courses where bid=?';
    var year=key;
    connection.query(sql,[year], function(err, rows, fields) {
      if (err) throw err;
      mentid=rows[0].mentorid;
      res.render('academics.ejs', { datas :rows });
    });
  });
  app.get('/academics/mentor',function(req,res){
    const sql='select * from mentor';
    // const text=req.body.text;
    connection.query(sql,function(err,result){
      if (err) throw err;
      const sendermail=result[0].memail;
      res.render('mentor.ejs',{item :result});
      console.log(sendermail);
    })
  })
  app.post('/academics/mentor', (req, res) => {
    const {email, query } = req.body;

  const mailOptions = {
    from: 'deekshithareddykandula@gamil.com',
    to:email,
    subject: 'New query from website',
    text: `Query: ${query}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});

  app.get('/academics/attendance',function(req,res){
    const sql='select * from attendance where rollnumber=?';
    connection.query(sql,[roll],function(err,result){
      if (err) throw err;
      res.render('attend.ejs',{items :result});
    })
  })
  app.get('/academics/timetable',function(req,res){
    const sql='select * from timetable where bid=?';
    connection.query(sql,[key],function(err,resu){
      if (err) throw err;
      res.render('timetable.ejs',{itemstt :resu});
    })
  })
  app.get('/examsection', function(req, res) {
    const sql = 'SELECT * FROM exam where bid=?';
    var year=key;
    connection.query(sql,[year], function(err, rows, fields) {
      if (err) throw err;
      res.render('exam.ejs', { edata :rows });
    });
  });
// set app port 
app.listen(4500);
