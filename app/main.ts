import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log("data received", data.toString());
    const inputData = data.toString().split(" ");
    console.log("inputData", inputData);
    const path = inputData[1];
    let userAgent = "";
    let userAgentTrimmed = "";
    if (data.toString().includes("User-Agent")) {
      userAgent = inputData[inputData.length - 1];
      console.log("AGENT 0", userAgent, userAgent.length);
      userAgentTrimmed = userAgent.replace(/\r\n\r\n/g, "");
      console.log("AGENT 1", userAgentTrimmed, userAgentTrimmed.length);
    }
    const splitPath = path.split("/");
    const route = splitPath[1];
    console.log("route", route);
    const showUserAgentLengthOrPathLength = data
      .toString()
      .includes("User-Agent")
      ? userAgentTrimmed.length
      : path.length;
    if (
      route.includes("echo") ||
      route.includes("user-agent") ||
      route === "/"
    ) {
      socket.write(
        Buffer.from(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentTrimmed.length}\r\n\r\n${showUserAgentLengthOrPathLength}`
        )
      );
      return;
    } else {
      socket.write(Buffer.from(`HTTP/1.1 404 Not Found\r\n\r\n`));
      return;
    }
  });
  socket.on("close", () => {
    console.log("closing connection");
    socket.end();
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is listening on localhost:4221");
});
