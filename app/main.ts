import * as net from "net";
import * as fs from 'fs';

function extractBodyData(data: string[]): string[] {
  // Find the index of the delimiter "\r\n\r\n"
  const delimiter = "\r\n\r\n";
  let startIndex = data.findIndex(item => item.includes(delimiter));

  if (startIndex !== -1) {
    startIndex;
  } else {
    startIndex = data.length;
  }

  const newArray = data.slice(startIndex);
  const final: string[] = []
  newArray.map((text) => {
    if (text.includes(delimiter)) {
      const newValue = text.replace(`application/octet-stream${delimiter}`, '');
      final.push(newValue);
    } else {
      final.push(text);
    }
  })
  return final;
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log('data received', data.toString())
    const inputData = data.toString().split(' ');
    console.log('inputData', inputData)
    const path = inputData[1];
    let userAgent = '';
    let userAgentTrimmed = '';
    const isUserAgentPresent = data.toString().includes('User-Agent');
    if (inputData[inputData.length - 2].includes('Accept-Encoding')) {
      const contentEncoding = inputData[inputData.length - 1];
      console.log('contentEncoding', contentEncoding.includes('invalid-encoding'))
      if (contentEncoding.includes('invalid-encoding')) {
        socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n`));
      } else {
        socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: ${contentEncoding}`));
      }
      return
    } else if (isUserAgentPresent) {
      userAgent = inputData[inputData.length - 1];
      userAgentTrimmed = userAgent.replace(/\r\n\r\n/g, '');
    }
    const splitPath = path.split('/')
    const route = splitPath[splitPath.length - 1]
    if (isUserAgentPresent) {
    // if (false) {
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentTrimmed.length}\r\n\r\n${userAgentTrimmed}`));
      return;
    } else if (inputData[0] === 'POST') {
      const dataToWrite = extractBodyData(inputData);
      const fileName = inputData[1].split('/')[2];
      const args = process.argv.slice(2);
      const [___, absPath] = args;
      const filePath = absPath + fileName;
      console.log('args', args, filePath)
      try {
        fs.writeFileSync(filePath, dataToWrite.join(' '), 'utf-8');
        console.log(`File written successfully to ${filePath}`);
        socket.write(Buffer.from("HTTP/1.1 201 Created\r\n\r\n"))
      } catch (err) {
        console.error('Error writing file:', err);
      }
      return;
    } else if (path.includes('echo')) {
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${route.length}\r\n\r\n${route}`));
      return;
    } else if (path === '/') {
      socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\nHello World`));
      return;
    } else if (path.includes('files')) {
      const fileName = inputData[1].split('/')[2];
      const args = process.argv.slice(2);
      const [___, absPath] = args;
      const filePath = absPath + "/" + fileName;
      const exists = fs.existsSync(filePath);
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
