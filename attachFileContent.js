var fs = require('fs');

var getSourceLogPath = function () {
	var fileNames = fs.readdirSync(__dirname + '/../');
	for (var fileName of fileNames) {
		if (fileName.match(/.htm(l?)$/)) {
			return `${__dirname}/../${fileName}`
		}
	}
};

var parseColor = function (line) {
	var matches;
	var classes = [];
	if (matches = line.match(/^<span style="color:(\s*)(\w+)">(.*)<\/span>(.*)$/i)) {
		classes.push(matches[2].toLowerCase());
		if (line.match(/ grows to size /i)) {
			classes.push('grows');
		}
		var classesString = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
		line = `<div${classesString}>${matches[3]}</div>`;
	}
	return line;
};
var parseHeadings = function (line) {
	line = line.trim();
	line = line.replace('<u><b>', '<h2>');
	line = line.replace('</b></u>', '</h2>');
	line = line.replace('<b>', '<h3>');
	line = line.replace('</b>', '</h3>');
	return line;
};
var parseLine = function (line) {
	line = line.replace('<br>', '');
	line = line.trim();
	line = parseColor(line);
	line = parseHeadings(line);
	return line;
};
var parseLines = function (snippet) {
	var lines = snippet.split("\n").map(function (line) {
		return parseLine(line);
	});
	return lines.filter(function (line) {
		return line.trim().length > 0;
	});
};
var getNewLines = function (lines, freshLines) {
	var out = [...freshLines];
	out.splice(0, freshLines.length - (freshLines.length - lines.length));
	return out;
};
var attachFileContent = function (interval, messagesCallback) {
	var logPath = getSourceLogPath();
	if (!logPath) {
		var msg = 'log file doesn\'t exists yet, please advance at least through one turn in game to create it.';
		console.error(msg);
		messagesCallback([`<div>${msg}</div>`]);
		process.exit(1);
	}
	var stats = fs.statSync(logPath);
	var content = fs.readFileSync(logPath).toString();
	var lines = parseLines(content);
	messagesCallback(lines, stats);
	fs.watchFile(logPath, {interval}, (stats) => {
		var freshContent = fs.readFileSync(logPath).toString();
		var freshLines = parseLines(freshContent);
		var newLines = getNewLines(lines, freshLines);
		messagesCallback(newLines, stats);
		newLines.forEach(function (message) {
			lines.push(message);
		});
	});
};

module.exports = attachFileContent;
