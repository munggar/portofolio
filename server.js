import express from "express";
import dotenv from "dotenv";
import fs from "fs";

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
    const msgLower = message.toLowerCase();

    // Baca data profil
    const profileData = JSON.parse(fs.readFileSync("public/profile.json", "utf-8"));

    if (!message || message.trim().length < 2) {
      return res.json({ reply: "Tolong tulis pertanyaan yang lebih jelas ya 😊" });
    }

    const forbiddenWords = [
      "politik", "agama", "porn", "sex", "narkoba", "suicide", "bom", "pemerintah"
    ];
    if (forbiddenWords.some(word => msgLower.includes(word))) {
      return res.json({ reply: "Maaf, aku tidak bisa membahas topik itu." });
    }

    const relevantKeywords = [
      "munggar", "project", "skill", "kemampuan", "website", "portfolio", "igar",
      "laravel", "node", "php", "js", "javascript", "pengalaman", "coding"
    ];

    const isRelevant = relevantKeywords.some(k => msgLower.includes(k));
    if (!isRelevant) {
      return res.json({
        reply: "Aku hanya bisa menjawab seputar Munggar Fajar Muharram dan portofolionya. Mau tanya tentang project atau skill-nya?"
      });
    }

    const context = `
Kamu adalah IgarBot, asisten portofolio pribadi milik ${profileData.name}, dia biasa dipanggil Igar.
Kamu hanya boleh menjawab tentang profil, skill, atau project milik Munggar Fajar Muharram.
Jika user bertanya hal di luar konteks, tolak dengan sopan.
Gunakan gaya bahasa yang profesional tapi ramah, dan selalu akurat berdasarkan data berikut:

Tentang: ${profileData.about}
Skill: ${profileData.skills.join(", ")}
Project:
${profileData.projects.map(p => `- ${p.name}: ${p.desc} (peran: ${p.role}, tech: ${p.tech.join(", ")})`).join("\n")}
`;

    const output = await client.conversational({
      model: "zai-org/GLM-4.6",
      inputs: `${context}\nUser: ${message}\nArchBot:`,
    });

    console.log("🧠 Context sent:", context);

    res.json({ reply: output.generated_text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Terjadi error di server." });
  }
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000 🚀")
);
