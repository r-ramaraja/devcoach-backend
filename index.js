const { Server } = require("node:http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

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

  socket.on("userMessage", (data) => {
    // Need to incorporate response from GPT-3
    socket.emit("GPTResponse", [
      data,
      {
        type: "AI",
        name: "Persona",
        text: "Generated text from GPT-3",
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
