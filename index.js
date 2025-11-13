import express from "express";
import { Telegraf } from "telegraf";
import { db, bucket } from "./firebase.js";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔹 Use your bot token from environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);

// 🔸 Handle text messages
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  await db.collection("messages").add({
    user: ctx.from.username || ctx.from.first_name,
    text,
    date: new Date().toISOString()
  });
  await ctx.reply("✅ Text saved to Firebase!");
});

// 🔸 Handle photo uploads
bot.on("photo", async (ctx) => {
  const photo = ctx.message.photo.pop();
  const fileId = photo.file_id;
  const file = await ctx.telegram.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

  // Download photo and upload to Firebase Storage
  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();
  const fileName = `uploads/${Date.now()}.jpg`;
  const fileRef = bucket.file(fileName);
  await fileRef.save(Buffer.from(buffer), { contentType: "image/jpeg" });
  const [url] = await fileRef.getSignedUrl({ action: "read", expires: "01-01-2030" });

  // Save URL to Firestore
  await db.collection("uploads").add({
    user: ctx.from.username || ctx.from.first_name,
    imageUrl: url,
    date: new Date().toISOString()
  });

  await ctx.reply("📸 Image uploaded to Firebase!");
});

// Required for Vercel
app.use(bot.webhookCallback(`/${process.env.BOT_TOKEN}`));

// 🔸 Set webhook automatically
app.get("/", async (req, res) => {
  const webhookUrl = `${req.protocol}://${req.get("host")}/${process.env.BOT_TOKEN}`;
  await bot.telegram.setWebhook(webhookUrl);
  res.send("🤖 Bot webhook set and running!");
});

app.listen(3000, () => console.log("Bot running on port 3000"));
export default app;
