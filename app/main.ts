import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log('data received', data.toString())
    const inputData = data.toString().split(' ');
    console.log('inputData', inputData)
    const path = inputData[1];
    const userAgent = inputData[inputData.length - 1];
    console.log('AGENT', userAgent)
    const userAgentTrimmed = userAgent ? userAgent.trim() : '';
    console.log('AGENT 2', userAgentTrimmed.length)
    const accpetableRoutes = ['/', '/echo', 'user-agent'];
    const splitPath = path.split('/')
    const route = splitPath[splitPath.length - 1]
    if (accpetableRoutes.includes(route)) {
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentTrimmed.length}\r\n\r\n${userAgentTrimmed}`));
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
