import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log('data from socket inbound', data.toString());
    socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
  })
  socket.on("close", () => {
    console.log('closing connection')
    socket.end();
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is listening on localhost:4221");
});
