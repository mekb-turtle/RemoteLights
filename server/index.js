if (process.argv.length != 3) {
	console.log(`Usage: ${process.argv[0]} ${process.argv[1]} /dev/ttyXXXX`);
	process.exit(1);
}

const mime = require("mime-types");
const express = require("express");
const cache = require("./cache");
const { SerialPort } = require("serialport");
const fs = require("fs");
const path = require("path");
const port = new SerialPort({ path: process.argv[2], baudRate: 9600 });
const listen = { port: 8080, address: "0.0.0.0" };

const app = express();
const server = null;

const queue = [];

port.on("data", data => {
	process.stdout.write(data);
});

process.stdin.on("data", data => {
	queue.push(data);
});

setTimeout(() => {
	setInterval(() => {
		if (queue.length > 0) {
			const data = queue.shift();
			port.write(data);
		}
	});
}, 3000);

process.once("SIGINT", () => {
	port.close();
	if (server) server.close();
	process.exit();
});

port.once("close", () => {
	process.stdin.end();
	if (server) server.close();
});

process.stdin.once("close", () => {
	port.close();
	if (server) server.close();
});

const filesDir = path.join(__dirname, "data");

function getFile(name) {
	return fs.readFileSync(path.join(filesDir, name));
}

const files = fs.readdirSync(filesDir);

for (const i in files) {
	const file = files[i];
	app.get("/" + (file == "index.html" ? "" : file), (req, res) => {
		const data = cache(file, getFile);
		const mimeType = mime.lookup(file);
		if (mimeType) {
			res.contentType(mimeType);
		}
		res.end(data, "binary");
	});
}

app.post("/send", (req, res) => {
	const queryCmd = req.query.command;
	if (queryCmd !== undefined && typeof queryCmd === "string" && queryCmd.match(/^([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
		const cmd = parseInt(queryCmd);
		const data = Buffer.concat([ Buffer.from("LED"), Buffer.from([cmd]) ]);
		queue.push(data);
		res.redirect(302, "/");
		return;
	}
	res.status(400);
});

app.listen(listen.port, listen.address, () => {
	console.log(`Server is running on http://${listen.address}:${listen.port}`);
});
