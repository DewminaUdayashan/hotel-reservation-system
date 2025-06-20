import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { executeQuery } from "@/lib/db";
import formidable from "formidable";

// Disable Next.js default body parser
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

  const uploadDir = path.join(process.cwd(), "public", "uploads", "hotels");

  const form = formidable({
    multiples: true,
    maxFileSize: 50 * 1024 * 1024, // 50 MB per file
    maxFieldsSize: 10 * 1024 * 1024, // 10 MB for fields
    uploadDir,
    keepExtensions: true,
    filename: (part: any) => {
      const timestamp = Date.now();
      return `${timestamp}-${part.originalFilename}`;
    },
  });

  try {
    const [fields, files] = await form.parse(req);

    const name = fields.name?.[0];
    const location = fields.location?.[0] || null;
    const description = fields.description?.[0] || null;
    const mapUrl = fields.mapUrl?.[0] || null;
    const logoUrl = fields.logoUrl?.[0] || null;

    if (!name) {
      return res.status(400).json({ error: "Hotel name is required" });
    }

    const hotelFolder = path.join(
      uploadDir,
      name.replace(/\s+/g, "-").toLowerCase()
    );
    if (!fs.existsSync(hotelFolder)) {
      fs.mkdirSync(hotelFolder, { recursive: true });
    }

    const imageInputs: { imageUrl: string; caption: string | null }[] = [];

    const uploadedFiles = Array.isArray(files.images)
      ? files.images
      : [files.images];
    const captions = fields.captions || [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const oldPath = file.filepath;
      const fileName = path.basename(file.originalFilename || file.newFilename);
      const newPath = path.join(hotelFolder, fileName);
      fs.renameSync(oldPath, newPath);

      const relativeUrl = `/uploads/hotels/${name.replace(/\s+/g, "-").toLowerCase()}/${fileName}`;
      imageInputs.push({
        imageUrl: relativeUrl,
        caption: captions[i] || null,
      });
    }

    // Construct inline table variable inserts
    const tvpStatements = imageInputs
      .map(
        (_, i) =>
          `INSERT INTO @images (imageUrl, caption) VALUES (@imageUrl${i}, @caption${i});`
      )
      .join("\n");

    const params = [
      { name: "name", value: name },
      { name: "location", value: location },
      { name: "description", value: description },
      { name: "mapUrl", value: mapUrl },
      { name: "logoUrl", value: logoUrl },
      ...imageInputs.flatMap((img, i) => [
        { name: `imageUrl${i}`, value: img.imageUrl },
        { name: `caption${i}`, value: img.caption },
      ]),
    ];

    const query = `
      DECLARE @images HotelImageInput;
      ${tvpStatements}
      EXEC CreateHotel
        @name = @name,
        @location = @location,
        @description = @description,
        @mapUrl = @mapUrl,
        @logoUrl = @logoUrl,
        @images = @images;
    `;

    await executeQuery(query, params);

    res.status(201).json({ message: "Hotel created successfully" });
  } catch (err) {
    console.error("Create hotel error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
