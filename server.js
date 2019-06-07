'use strict';
 
const express = require('express'),
      fs = require('fs'),
      bodyParser = require('body-parser');

const app = express(),
      port = 5000,
      fileName = "sensorData.json";

exports = module.exports = function(){

    app.use(bodyParser.json());

    app.get('/sensor/:id/data/', function (req, res) {
      fs.readFile(fileName, 'utf8', function(err, contents) {
        res.json(JSON.parse(contents));
      });
    });

    app.put('/sensor/:id/data/', function (req, res) {

      var data = req.body;
        
      fs.writeFile(fileName, JSON.stringify(data), 'utf8', function(error){
        var contents = "successfully stored";
        if(error) {
          contents = "write failed";
        } else {
          res.send(contents);
        }
      });
      
    });

    app.listen(port, () => console.log(`Data API listening on port ${port}`))
};


