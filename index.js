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

const agent_stakeholder0 = new DevAgent("Sarah", "I want you to act as a stakeholder in a software development process for building a movie review website. You are responsible for describe initial requirements in non-technical language and communicate with other team members to revise it.");

const agent_stakeholder1 = new DevAgent("Mike", "I want you to act as a unfriendly stakeholder in a software development process for building a movie review website. You are responsible for describe initial requirements in vague non-technical language and negatively communicate with other team members");

const agent_teamleader = new DevAgent("Tom", "I want you to act as a teamleader in a software team. You are in a software development process for building a movie review website. You are responsible for provide high level design decision, break down the tasks and assign tasks to team members and provide feedback to their completed tasks, and ensures that the team follows Agile practices and principles.");

const agent_developer = new DevAgent("Sam", "I want you to act as a developer in a software team. You are in a software development process for building a movie review website. You are responsible for participating in design discussions to ensure the design is technical feasibility.");

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("userMessage", async (data) => {
    // Need to incorporate response from GPT-3
    console.log(data);
    const response = await agent_stakeholder0.chatWithUser(data.text);
    console.log(response);
    socket.emit("GPTResponse", [
      data,
      {
        type: "AI",
        name: agent_stakeholder0.name,
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

// test chat with agent with get request
app.get("/chat", async (req, res) => {
  const agent = new DevAgent("Tom")
  const response = await agent.chatWithUser("How are you today?")
  console.log(response)
  res.json({ message: "Reach out to ramaraja@vt.edu" });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
