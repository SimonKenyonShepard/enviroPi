'use strict';

const request = require('request');
const server = "http://localhost";

const getData = (id) => {
  return new Promise((resolve, reject) => {
    request(`${server}/sensor/${id}/data`, function (error, response, body) {
      if(error) reject(error)
      resolve(JSON.parse(body));
    });
  });
};

const putData = (id, data) => {
  return new Promise((resolve, reject) => {
    request({ url: `${server}/sensor/${id}/data`, method: 'PUT', json: data}, resolve).on('error', reject)
  });
}

const appendToEndpoint = (id, dataPoint) => {
  return new Promise(function(resolve, reject) {
    getData(id)
      .then(response => {
        response.push(dataPoint);
        return response;
      })
      .then(response => putData(id, response))
      .then(response => resolve(response))
  });
}

module.exports = {
  appendToEndpoint: appendToEndpoint
}


