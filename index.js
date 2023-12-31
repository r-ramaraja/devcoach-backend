const { Server } = require("node:http");
const express = require("express");
const socketIO = require("socket.io");
const Agent = require("./agent");

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

  socket.on("developPhaseInitialMessage", async () => {
    const response = await agent.getUserStory();

    console.log(response);
    const { name, role, text } = JSON.parse(response);
    socket.emit("GPTResponse", [
      {
        type: "AI",
        name,
        text,
        role,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
      },
    ]);
  });

  socket.on("userMessage", async (data) => {
    console.log("🚀 ~ file: index.js:20 ~ socket.on ~ data:", data);
    let response;
    if (data.phase && data.phase === "develop") {
      response = await agent.chatWithUserInDevelopPhase(data.text, data.code);
    } else if (data.phase && data.phase === "design") {
      response = await agent.chatWithUserInDesignPhase(data.text);
    }

    console.log(response);
    const { name, role, text } = JSON.parse(response);
    socket.emit("GPTResponse", [
      data,
      {
        type: "AI",
        name,
        text,
        role,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
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

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
