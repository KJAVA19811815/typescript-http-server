import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const [method, path, version] = data.toString().split(' ');
    console.log('PATH', path, path.includes('echo'), path.split('/'));
    const splitPath = path.split('/')
    const route = splitPath[splitPath.length - 1]
    if (path.includes('echo') || path === '/') {
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${route.length}\r\n\r\n${route}`));
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
