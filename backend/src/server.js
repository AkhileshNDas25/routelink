import express from "express";
const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Server is working fine! Badhiya 👍");
  console.log("badhiya");
});

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
