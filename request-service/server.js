//
//  1st method: make request to another microservice, via requestor-p
//   - queue the promise 'resolve' in 'pending', sync reply on 'message'
//   - reusable in other microservices
//
const name = 'requestor';
const express = require('express');
const request = require('./requestor-p');
const { randomInt, getTime } = require('./helpers');

//const address = `tcp://localhost:${port}`
const zeromq_port = process.env.ZMQ_PORT || 8672;
const http_port = process.env.HTTP_PORT || 8686;
const http_host = process.env.HTTP_HOST || 'localhost';
const zeromq_address = process.env.ZMQ_RES_ADDRESS || `tcp://localhost:${zeromq_port}`;

console.log(`
  zmq address: ${zeromq_address}
  http port: ${http_port}
`)

const app = express();

app.get('/ping', (req, res) => {
  console.log('sending ping request');
  request.send({
    address: zeromq_address,
    data: {
      action: 'ping',
      recieved: getTime(),
    },
  })
    .then((reply) => {
      res.header('Content-Type', 'application/json');
      res.status(200).send(reply)
    })
    .catch(console.error)
});

app.get('/increment/:number', (req, res) => {
  console.log('sending increment request');
  request.send({
    address: zeromq_address,
    data:{
      action: 'increment',
      number: req.params.number,
      recieved: getTime(),
    },
  })
    .then((reply) => {
      res.header('Content-Type', 'application/json');
      res.status(200).send(reply)
    })
    .catch(console.error)
});

app.get('/reflect', (req, res) => {
  const conn = req.connection;
  const data = {
    recieved: getTime(),
    host: req.header.host,
    local: {
      address: conn.localAddress,
      port: conn.localPort,
    },
    remote: {
      address: conn.remoteAddress,
      port: conn.remotePort,
    }
  }
  res.header('Content-Type', 'application/json');
  res.status(200).send(data);
});


//const server = app.listen(http_port, http_host, () => {
const server = app.listen(http_port, () => {
   const host = server.address().address;
   const port = server.address().port;
   console.log(`${name}, listening: http://${host}:${port}`);
});
