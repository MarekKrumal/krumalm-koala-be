import express from "express";
import dotenv from "dotenv";
import { getLogic } from "./main";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/api", async (req, res) => {
  try {
    const data = await getLogic();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/api`);
});
