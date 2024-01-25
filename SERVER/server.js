const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.json()); // Parse JSON request bodies

app.all('/update-content', (req, res) => {
  const newData = req.body.data;

  if (newData) {
    io.emit('contentUpdated', newData);
    res.send('Content updated successfully');
  } else {
    res.status(400).send('Bad Request: Data missing');
  }
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
