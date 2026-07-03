// @polsia:user-owned — Upload manuscript file with encryption + word count extraction.
import 'server-only';
import { NextResponse } from 'next/server';
import { UploadResponseSchema } from '@/lib/contracts/manuscript';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requireAuth, type SessionUser } from '@/lib/require-auth';

const UPLOAD_DIR = '/tmp/uploads';

function encryptBuffer(buffer: Buffer, key: string): Buffer {
  const crypto = require('node:crypto');
  const keyBuffer = Buffer.from(key.slice(0, 32), 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

async function extractWordCount(filePath: string, mimeType: string): Promise<number> {
  // Placeholder: in production, use pdfjs-dist for PDFs and mammoth for DOCX
  // For now, estimate 250 words per page for PDFs
  if (mimeType === 'application/pdf') {
    const fs = require('node:fs');
    const stats = fs.statSync(filePath);
    const estimatedPages = Math.ceil(stats.size / 1500);
    return estimatedPages * 250;
  }
  return 0;
}

export async function POST(req: Request) {
  let user: SessionUser;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const coverImage = formData.get('coverImage') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const author = await prisma.author.findUnique({
      where: { userId: user.id },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const key = env.ENCRYPTION_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Encryption not configured' }, { status: 500 });
    }
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const encryptedBuffer = encryptBuffer(fileBuffer, key);

    const fs = require('node:fs');
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${UPLOAD_DIR}/${fileName}`;
    fs.writeFileSync(filePath, encryptedBuffer);

    let coverImagePath: string | undefined;
    if (coverImage) {
      const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
      const encryptedCover = encryptBuffer(coverBuffer, key);
      const coverName = `${Date.now()}-cover-${coverImage.name}`;
      coverImagePath = `${UPLOAD_DIR}/${coverName}`;
      fs.writeFileSync(coverImagePath, encryptedCover);
    }

    const wordCount = await extractWordCount(filePath, file.type);

    const result = {
      filePath,
      fileName: file.name,
      wordCount,
      mimeType: file.type,
      fileSize: file.size,
      coverImagePath,
    };

    const validated = UploadResponseSchema.parse(result);
    return NextResponse.json(validated, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
