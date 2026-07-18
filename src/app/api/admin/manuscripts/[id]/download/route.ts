import 'server-only';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requireAdminApi } from '@/lib/require-admin-api';
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApi();
  } catch (res) {
    return res as Response;
  }

  try {
    const { id } = await params;
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'manuscript'; // 'manuscript' or 'cover'

    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const filePath = type === 'cover' ? manuscript.coverImagePath : manuscript.filePath;
    
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

    const key = env.ENCRYPTION_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Encryption key not configured' }, { status: 500 });
    }

    const encryptedBuffer = fs.readFileSync(filePath);
    const decryptedBuffer = decryptBuffer(encryptedBuffer, key);

    const fileName = type === 'cover' ? `cover-${manuscript.fileName}` : manuscript.fileName;
    const mimeType = type === 'cover' ? 'image/jpeg' : manuscript.mimeType;

    return new NextResponse(decryptedBuffer, {
      headers: {
        'Content-Type': mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error('Download failed', err);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
