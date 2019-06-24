'use strict';
 
const express = require('express'),
      fs = require('fs'),
      bodyParser = require('body-parser'),
      cors = require('cors');

const app = express(),
      port = 5000,
      fileNamePrefix = "sensorData";

var currentDay; 

const getFileName = function() {
  const today = new Date().toISOString().slice(0,10);
  const fileName = `${fileNamePrefix}_${today}.json`;
  if(today !== currentDay) {
    createFileIfDoesntExist(fileName);
    currentDay = today;
  }
  return fileName;
}

const createFileIfDoesntExist = function(fileName) {
  fs.writeFileSync(fileName, JSON.stringify([]));
}

exports = module.exports = function(){

    app.use(cors());
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

    app.get('/sensor/:id/data/today', function (req, res, next) {
      
      fs.readFile(getFileName(), 'utf8', function(err, contents) {
        
        try {
          res.json(JSON.parse(contents));
        } catch (e) {
          next(err);
        }
        
      });
    });

    app.post('/sensor/:id/data/today', function (req, res, next) {
      try {
        var payloadData = req.body;
        var fileName = getFileName();
        fs.readFile(fileName, 'utf8', function(err, contents) {
          if(!err) {
            var newData = JSON.parse(contents);
            newData.push(payloadData);
            fs.writeFile(fileName, JSON.stringify(newData), 'utf8', function(error){
              var contents = "successfully stored";
              if(error) {
                contents = "write failed";
              } else {
                res.send(contents);
              }
            });
          } else {
            console.log(err);
          }
          
        });
      } catch (e) {
        next(e);
      }
    });

    app.put('/sensor/:id/data/today', function (req, res, next) {

      try {
        var data = JSON.stringify(req.body);
        fs.writeFile(getFileName(), data, 'utf8', function(error){
          var contents = "successfully stored";
          if(error) {
            contents = "write failed";
          } else {
            res.send(contents);
          }
        });
      } catch (e) {
        next(e);
      }      
    });

    app.listen(port, () => console.log(`Data API listening on port ${port}`))
};


