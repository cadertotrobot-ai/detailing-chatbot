require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const rateLimit = require("express-rate-limit");
const businessInfo = require("./business-info");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    error: "Too many messages. Please slow down.",
  },
});

app.use("/chat", chatLimiter);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages are required and must be an array.",
      });
    }

    const systemPrompt = `
You are a chatbot for this auto detailing business.

Use ONLY the business information below when answering questions about services, pricing, hours, location, booking, policies, and availability.

${businessInfo}

Important rules:
- Be friendly and concise.
- Do not make up prices, discounts, or guaranteed appointment times.
- If the customer wants to book, collect:
  1. Name
  2. Phone number
  3. Vehicle year/make/model
  4. Vehicle size
  5. Desired service
  6. Mobile or drop-off
  7. Preferred date and time
- If you have all booking details, summarize them and say the business will confirm availability.
- If the customer asks for something not listed, say the team can review it and provide a custom quote.
- Do not claim to process payments.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.4,
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Something went wrong with the chatbot.",
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Detailing chatbot running on http://localhost:${process.env.PORT || 3000}`
  );
});
