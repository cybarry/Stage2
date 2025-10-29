// src/utils/image.js
import { createCanvas } from "canvas";
import fs from "fs/promises";
import path from "path";

export async function createSummaryImage({ total, top5, timestamp, outPath }) {
  const width = 1000;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#000";
  ctx.font = "bold 30px Sans";
  ctx.fillText("Countries Summary", 40, 60);

  ctx.font = "16px Sans";
  ctx.fillText(`Last refreshed: ${timestamp}`, 40, 100);
  ctx.fillText(`Total countries: ${total}`, 40, 130);

  ctx.font = "20px Sans";
  ctx.fillText("Top 5 by estimated_gdp", 40, 180);

  ctx.font = "16px Sans";
  let y = 220;
  if (!top5 || top5.length === 0) {
    ctx.fillText("No GDP data available", 40, y);
  } else {
    for (let i = 0; i < top5.length; i++) {
      const item = top5[i];
      const g = Number(item.estimated_gdp || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
      ctx.fillText(`${i + 1}. ${item.name} — ${g}`, 40, y);
      y += 30;
    }
  }

  // Ensure dir exists
  const dir = path.dirname(outPath);
  await fs.mkdir(dir, { recursive: true });

  const buffer = canvas.toBuffer("image/png");
  await fs.writeFile(outPath, buffer);
}
