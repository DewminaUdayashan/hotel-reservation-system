import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import formidable from "formidable";
import { executeQuery } from "@/lib/db";

// Disable default body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const user = getUserFromToken(token || "");

  if (!user || user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "rooms");

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024,
    maxFieldsSize: 10 * 1024 * 1024,
    filename: (part: any) => `${Date.now()}-${part.originalFilename}`,
  });

  try {
    const [fields, files] = await form.parse(req);

    const name = fields.name?.[0];
    const description = fields.description?.[0] || null;
    const status = fields.status?.[0];
    const type = parseInt(fields.roomTypeId?.[0] || "0", 10);
    const bedType = fields.bedType?.[0] || null;
    const viewType = fields.viewType?.[0] || null;
    const hotelId = parseInt(fields.hotelId?.[0] || "0", 10);

    if (!name || !status || !hotelId || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save uploaded images
    const roomFolder = path.join(
      uploadDir,
      name.replace(/\s+/g, "-").toLowerCase()
    );
    if (!fs.existsSync(roomFolder)) {
      fs.mkdirSync(roomFolder, { recursive: true });
    }

    const uploadedFiles = Array.isArray(files.images)
      ? files.images
      : [files.images];
    const captions = fields.captions || [];

    const imageInputs: { imageUrl: string; caption: string | null }[] = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const oldPath = file.filepath;
      const fileName = path.basename(file.originalFilename || file.newFilename);
      const newPath = path.join(roomFolder, fileName);
      fs.renameSync(oldPath, newPath);

      const relativeUrl = `/uploads/rooms/${name.replace(/\s+/g, "-").toLowerCase()}/${fileName}`;
      imageInputs.push({
        imageUrl: relativeUrl,
        caption: captions[i] || null,
      });
    }

    // Build inline table variable population
    const tvpStatements = imageInputs
      .map((_, i) => `INSERT INTO @images (imageUrl) VALUES (@imageUrl${i});`)
      .join("\n");

    const query = `
      DECLARE @images RoomImageInput;
      ${tvpStatements}
      EXEC CreateRoom
        @name = @name,
        @description = @description,
        @status = @status,
        @type = @type,
        @bedType = @bedType,
        @viewType = @viewType,
        @hotelId = @hotelId,
        @images = @images;
    `;

    const params = [
      { name: "name", value: name },
      { name: "description", value: description },
      { name: "status", value: status },
      { name: "type", value: type },
      { name: "bedType", value: bedType },
      { name: "viewType", value: viewType },
      { name: "hotelId", value: hotelId },
      ...imageInputs.flatMap((img, i) => [
        { name: `imageUrl${i}`, value: img.imageUrl },
      ]),
    ];

    await executeQuery(query, params);

    res.status(201).json({ message: "Room created successfully" });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
