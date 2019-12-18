var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var attachFileContent = require('./attachFileContent');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	attachFileContent(1000,function (lines, stats) {
		var size = stats ? stats.size : undefined;
		io.emit('message', {lines, size});
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
