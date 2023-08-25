//MODULES
const fs = require('fs');
const http = require('http');
const url = require('url');
const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const db = require('./config/db_conn.js');
const express = require('express');
const app = express();
const login_page = fs.readFileSync(`${__dirname}/template/login_page.html`, 'utf-8');
const register_page = fs.readFileSync(`${__dirname}/template/register_page.html`, 'utf-8');
const edit_page = fs.readFileSync(`${__dirname}/template/edit_page.html`, 'utf-8');

//MIDDLEWAE
const body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

const oneDay = 1000 * 24 * 60 * 60;
app.use(sessions({
  secret: "bfjhsdfgdfgdjfg",
  saveUninitialized: true,
  cookie: { maxage: oneDay },
  resave: false

}));

app.use(cookieParser());


const transporter = nodemailer.createTransport({

  service: 'Gmail',
  auth: {
    user: 'subhamani1299@gmail.com',
    pass: 'iofblwscatdemvkx'
  }
  
});

//NODE FUNCTION

app.get('/login', (req, res) => {
    
  
  
    res.send(login_page);
});


app.get('/logout', (req, res) => {
  
  req.session.destroy();
  res.send(login_page);

  })

app.get('/register', (req, res) => {

  var session = req.session.role;
  if (session) {
  res.send(register_page);
  } else {
    res.redirect('/login')
  }

});

app.post('/submitform', (req, res) => {
  
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
 

  var login_qry =`SELECT * FROM user_table WHERE username = '${username}' and active_status = '1' `;

  db.query(login_qry, (err, result) => {
    if (err) {
      res.status(404).send(err);
    }else {
      if (result != '') {
        // User login logic
        
      const userProvidedPassword = password;
        
      const storedPasswordHash = result[0].password; // Retrieve this from the database

     bcrypt.compare(userProvidedPassword, storedPasswordHash, (err, hash) => {
    if (err) {
        console.error('Error comparing passwords:', err);
    } else if (hash) {
      console.log('Passwords match! User can log in.');
        req.session.username = result[0].username;
        req.session.password = result[0].password;
        req.session.role = result[0].role;
        req.session.save();
      console.log(req.session);
      
       res.redirect('/register');
    } else {
      res.send('Passwords do not match. Access denied.')
    }
    });
        
      } else {
        res.send('Username is incorrect');
      }
    }
    

  });

});

app.post('/add', (req, res) => {
    var username = req.body.username;
    var firstname = req.body.firstname;
    var email = req.body.email;
    var mobile_no = req.body.mobile_no;
    var password = req.body.password;
  
  const saltRounds = 10;
  const decryptPassword = password;
  
  
    bcrypt.hash(decryptPassword, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
      }
      else {
      
     
          var query = `INSERT INTO user_table(username, firstname, email, mobile_no, password,role) VALUES('${username}','${firstname}','${email}','${mobile_no}','${hash}','2')`;
          db.query(query, function(err, result) {
          if(err){
            res.send(err);
          } else {
           const loginSuccessfulEmail = {
                  from:'subhamani1299@gmail.com',
                  to: email,
                  subject: 'Node App !Login Successful',
                  text: 'You have successfully logged in to our application.'
           
            };
            
           transporter.sendMail(loginSuccessfulEmail, (error, info) => {
                  if (error) {
                  console.error('Error sending email:', error);
                  } else {
                    console.log('Email sent:', info.response);
                     res.redirect('/login');
                  }
                  });
           
          }
  })
    
        

    }
    
  });





});


app.get('/api/v1/registerdetails', (req, res) => {

  const session_role = req.session.role;
  const session_user = req.session.username;
  const session_pass= req.session.password;

  if (session_role == 2) {
    var query = `SELECT * from user_table where username ='${session_user}' and password='${session_pass}'and active_status='1' and role ='${session_role}'`;
    db.query(query, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    })
  }
  else{
    
 var query = `SELECT * from user_table where active_status='1' `;
    db.query(query, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    })






  }

});

app.get('/fetchuser/:id', (req, res) => {
  res.send(edit_page);
});

app.get('/deleteuser/:id', (req, res) => {
  
  const status = '2';
  const user_id =req.params.id;

  var deleteqry =`UPDATE user_table SET active_status ="${status}" WHERE id="${user_id}"`;
  db.query(deleteqry, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/register');
    }

  })



  
});


app.get('/api/v1/editdetails/:id', (req, res) => {
  
  var qry = `SELECT * FROM user_table where id='${req.params.id}'`;
  db.query(qry, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }

  })

});

app.post('/updatedata', (req, res) => {
    
   
    var username = req.body.username;
    var firstname = req.body.firstname;
    var email = req.body.email;
    var mobile_no = req.body.mobile_no;
    var password = req.body.password;
    var user_id = req.body.id;

  var update_qry =`UPDATE user_table SET username="${username}",firstname="${firstname}",password="${password}",email="${email}",mobile_no="${mobile_no}" where id="${user_id}"`;

  db.query(update_qry, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/register');
    }

  })


})


//SERVER 
const port = 8000;

app.listen(port, 'localhost', () => {

    console.log(`Server is running on port ${port}`);
});






