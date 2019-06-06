'use strict';

// const https = require('https');
const request = require('request');

const getBin = (binId) => {
  return new Promise((resolve, reject) => {
    request(`https://api.jsonbin.io/b/${binId}/latest`, function (error, response, body) {
      if(error) reject(error)

      resolve(JSON.parse(body));
    });

    // https.get(`https://api.jsonbin.io/b/${binId}/latest`, (res) => {
    //   let body = []
    //   res.on('data', (data) => {
    //     body.push(data);
    //   });
    //   res.on('end', () => {
    //     resolve(
    //       JSON.parse(body.join())
    //     );
    //   });

    // }).on('error', error => {
    //   reject(error);
    // });
  });
};

const putBin = (binId, data) => {
  return new Promise((resolve, reject) => {

    request({ url: `https://api.jsonbin.io/b/${binId}/latest`, method: 'PUT', json: data}, resolve).on('error', reject)

    // const body = JSON.stringify(data);

    // const options = {
    //   hostname: 'api.jsonbin.io',
    //   port: 443,
    //   path: `/b/${binId}`,
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Content-Length': body.length
    //   }
    // }

    // const req = https.request(options, (res) => {
    //   let body = []
    //   res.on('data', (data) => {
    //     body.push(data);
    //   });
    //   res.on('end', () => {
    //     resolve(
    //       JSON.parse(body.join())
    //     );
    //   });
    // })

    // req.on('error', (error) => {
    //   reject(error);
    // })

    // req.write(body)
    // req.end();

  });
}

const appendJsonBin = (binId, dataPoint) => {
  return new Promise(function(resolve, reject) {
    getBin(binId)
      .then(response => {
        response.push(dataPoint);

        return response;
      })
      .then(response => putBin(binId, response))
      .then(response => resolve(response))
  });
}

module.exports = {
  appendJsonBin: appendJsonBin
}


