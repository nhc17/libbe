require('dotenv').config()
//load libraries
const bodyParser = require('body-parser'),
      cors = require('cors'),
      express = require('express'),
      multer = require('multer'),
      mysql = require('mysql'),
      path = require('path'),
      request = require('request');
    
//create an instance of express 
const app = express();


//Define Routes



//Start express application
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening to server at ${PORT}`)
})
