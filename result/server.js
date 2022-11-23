const express = require('express'),
  async = require('async'),
  pg = require('pg'),
  { Pool } = require('pg'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  methodOverride = require('method-override');

// Define application
const app = express()
const server = require('http').createServer(app)

// Configure websocket (through socket.io usage)
const io = require('socket.io')(server, {
  transports: ['polling']
});

// Define application middlewares 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

server.listen(process.env.PORT || 5000, function () {
  var port = server.address().port;
  console.log('App running on port ' + port);
});

// Handle websocket client connections
io.sockets.on('connection', function (socket) {
  console.log("new socket.io connection")
  socket.emit('message', { text: 'Welcome!' });
  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});

// Handle Postgres connection
var PG_USER = process.env.POSTGRES_USER || 'postgres'
var PG_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres'
var PG_DATABASE = process.env.POSTGRES_DATABASE || 'postgres'
var pool = new pg.Pool({
  connectionString: `postgres://${PG_USER}:${PG_PASSWORD}@db/${PG_DATABASE}`
});

// Connect to Postgres once its ready
async.retry(
  { times: 1000, interval: 1000 },
  function (callback) {
    pool.connect(function (err, client, done) {
      if (err) {
        console.error("Waiting for db");
      }
      callback(err, client);
    });
  },
  function (err, client) {
    if (err) {
      return console.error("Giving up");
    }
    console.log("Connected to db");
    getVotes(client);
  }
);

// Retrieve votes every second and send update to socket.io clients
function getVotes(client) {
  client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], function (err, result) {
    if (err) {
      console.error("Error performing query: " + err);
    } else {
      var votes = collectVotesFromResult(result);
      io.sockets.emit("scores", JSON.stringify(votes));
    }

    setTimeout(function () { getVotes(client) }, 2000);
  });
}

// Change result format
function collectVotesFromResult(result) {
  var votes = { a: 0, b: 0 };

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}
