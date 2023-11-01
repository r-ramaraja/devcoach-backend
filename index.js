const { Server } = require("node:http");
const express = require("express");
const socketIO = require("socket.io");
const DevAgent = require("./DevAgent");
const Agent = require("./Agent");

const PORT = 3001;
const app = express();
const http = Server(app);
const io = socketIO(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  const agent = new Agent();

  socket.on("userMessage", async (data) => {
    console.log(data);

    const response = await agent.chatWithUser(data.text);
    console.log(response);
    const [name, text] = response.includes(":")
      ? response.split(":")
      : `Tom:${response}`.split(":");
    socket.emit("GPTResponse", [
      data,
      {
        type: "AI",
        name,
        text,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
      },
    ]);
  });

  socket.on("disconnect", () => {
    console.log(`🔥: ${socket.id} user disconnected`);
    socket.disconnect();
  });
});

app.get("/help", (req, res) => {
  res.json({ message: "Reach out to ramaraja@vt.edu" });
});

// test chat with agent with get request
app.get("/chat", async (req, res) => {
  const agent = new DevAgent("Tom");
  const response = await agent.chatWithUser("How are you today?");
  console.log(response);
  res.json({ message: "Reach out to ramaraja@vt.edu" });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
