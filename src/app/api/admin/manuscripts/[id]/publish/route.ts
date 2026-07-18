import 'server-only';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requireAdminApi } from '@/lib/require-admin-api';
import { uploadToDraft2Digital } from '@/lib/publish/d2d-automation';
import fs from 'node:fs';

function decryptBuffer(buffer: Buffer, key: string): Buffer {
  const crypto = require('node:crypto');
  const keyBuffer = Buffer.from(key.slice(0, 32), 'utf8');
  const iv = buffer.slice(0, 16);
  const authTag = buffer.slice(16, 32);
  const encrypted = buffer.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApi();
  } catch (res) {
    return res as Response;
  }

  try {
    const { id } = await params;
    
    if (!env.DRAFT2DIGITAL_USERNAME || !env.DRAFT2DIGITAL_PASSWORD) {
      return NextResponse.json({ error: 'Draft2Digital credentials not configured' }, { status: 500 });
    }

    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const key = env.ENCRYPTION_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Encryption key not configured' }, { status: 500 });
    }

    // Decrypt Manuscript
    const encryptedManuscript = fs.readFileSync(manuscript.filePath);
    const decryptedManuscript = decryptBuffer(encryptedManuscript, key);

    // Decrypt Cover
    let decryptedCover: Buffer | null = null;
    if (manuscript.coverImagePath && fs.existsSync(manuscript.coverImagePath)) {
      const encryptedCover = fs.readFileSync(manuscript.coverImagePath);
      decryptedCover = decryptBuffer(encryptedCover, key);
    }

    // Trigger Playwright Automation
    const result = await uploadToDraft2Digital(
      decryptedManuscript,
      decryptedCover,
      {
        title: manuscript.title,
        authorName: manuscript.author.penName || manuscript.author.legalName || 'Unknown',
        description: manuscript.blurb || '',
        username: env.DRAFT2DIGITAL_USERNAME,
        password: env.DRAFT2DIGITAL_PASSWORD,
      }
    );

    // Update status to PUBLISHING
    await prisma.manuscript.update({
      where: { id },
      data: { 
        status: 'PUBLISHING',
        publishedUrl: result.url,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Publish failed', err);
    return NextResponse.json({ error: 'Automated publish sequence failed' }, { status: 500 });
  }
}
