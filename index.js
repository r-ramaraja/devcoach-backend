const { Server } = require("node:http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const DevAgent = require("./DevAgent");

const PORT = 3001;
const app = express();
const http = Server(app);
const io = socketIO(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("userMessage", async (data) => {
    // Need to incorporate response from GPT-3
    const agent = new DevAgent("Mike");
    const response = await agent.chatWithUser(data);
    console.log(response);
    socket.emit("GPTResponse", [
      data,
      {
        type: "AI",
        name: agent.name,
        text: response,
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

// // test chat with agent with get request
// app.get("/chat", async (req, res) => {
//   const agent = new DevAgent("Tom")
//   const response = await agent.chatWithUser("How are you today?")
//   console.log(response)
//   res.json({ message: "Reach out to ramaraja@vt.edu" });
// });

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
