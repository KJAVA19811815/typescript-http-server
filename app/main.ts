import * as net from "net";
import * as fs from 'fs';

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log('data received', data.toString())
    const inputData = data.toString().split(' ');
    console.log('inputData', inputData)
    const path = inputData[1];
    let userAgent = '';
    let userAgentTrimmed = '';
    const isUserAgentPresent = data.toString().includes('User-Agent');
    if (isUserAgentPresent) {
      userAgent = inputData[inputData.length - 1];
      userAgentTrimmed = userAgent.replace(/\r\n\r\n/g, '');
    }
    const splitPath = path.split('/')
    const route = splitPath[splitPath.length - 1]
    if (isUserAgentPresent) {
    // if (false) {å
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentTrimmed.length}\r\n\r\n${userAgentTrimmed}`));
      return;
    } else if (path.includes('echo')) {
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${route.length}\r\n\r\n${route}`));
      return;
    } else if (path === '/') {
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\nHello World`));
      return;
    } else if (path.includes('files')) {
      const fileNameFromPath = inputData[1].split('/')[2];
      console.log('fileNameFromPath', fileNameFromPath)
      const filePath = `/tmp/${fileNameFromPath}`;
      const exists = fs.existsSync(filePath);
      console.log('exists', exists)
      if (exists) {
        fs.readFile(filePath, (err, fileContents) => {
          socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContents.toString().length}\r\n\r\n${fileContents.toString()}`));
        });
      } else {
        socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n"));
      }
      return;
    } else {
      socket.write(Buffer.from(`HTTP/1.1 404 Not Found\r\n\r\n`));
      return;
    }
  })
  socket.on("close", () => {
    console.log('closing connection')
    socket.end();
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is listening on localhost:4221");
});
