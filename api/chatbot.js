import { WordTokenizer, JaroWinklerDistance } from 'natural';
import axios from 'axios';

const tokenizer = new WordTokenizer();
const SHEET_API = "https://api.sheetbest.com/sheets/db05bd49-503d-4fdb-979b-7fbfd05f87e2";

export default async function handler(req, res) {
  const userQuestion = req.query.q?.toLowerCase();
  if (!userQuestion) {
    return res.status(400).json({ error: "سوال ارسال نشده است" });
  }

  try {
    const { data } = await axios.get(SHEET_API);

    let bestMatch = "";
    let bestAnswer = "";
    let bestScore = 0;

    for (let row of data) {
      const sheetQuestion = (row["سوال"] || "").toLowerCase();
      const sheetAnswer = row["پاسخ"] || "";

      const score = JaroWinklerDistance(userQuestion, sheetQuestion);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = sheetQuestion;
        bestAnswer = sheetAnswer;
      }
    }

    if (bestScore < 0.7) {
      return res.json({ answer: "متأسفم، پاسخ مناسب پیدا نشد." });
    }

    return res.json({ answer: bestAnswer, match: bestMatch, score: bestScore });
  } catch (err) {
    return res.status(500).json({ error: "خطا در ارتباط با سیستم پاسخ‌گو" });
  }
}
