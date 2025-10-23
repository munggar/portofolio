import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public")); // kalau ada folder frontend

/**
 * Client custom untuk memanggil Hugging Face router API
 */
const client = {};

/**
 * Fungsi conversational menggunakan Hugging Face router
 */
client.conversational = async function ({ model, inputs }) {
  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model, // contoh: "katanemo/Arch-Router-1.5B:hf-inference"
        messages: [{ role: "user", content: inputs }],
        stream: false,
      }),
    });

    const result = await response.json();
    const reply = result?.choices?.[0]?.message?.content;

    return { generated_text: reply || "Maaf, AI tidak memberikan jawaban." };
  } catch (err) {
    console.error("❌ Error in conversational():", err);
    return { generated_text: "Terjadi kesalahan pada AI router." };
  }
};

/**
 * Endpoint API chat
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const output = await client.conversational({
      model: "katanemo/Arch-Router-1.5B:hf-inference",
      inputs: message,
    });

    res.json({ reply: output.generated_text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Terjadi error di server." });
  }
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000 🚀")
);
