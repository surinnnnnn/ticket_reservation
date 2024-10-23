// src/crypto/crypto.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly secretKey: string;
  private readonly algorithm: string;
  private readonly ivLength: number;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('SECRET_KEY');
    this.algorithm = this.configService.get<string>('ALGORITHM');
    this.ivLength = parseInt(this.configService.get<string>('IV_LENGTH'), 10);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.secretKey, 'utf-8'),
      iv,
    );
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift() as string, 'hex');
    const encryptedTextBuffer = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.secretKey, 'utf-8'),
      iv,
    );

    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
  }

  hashCardNumber(cardNumber: string): string {
    const normalizedCardNumber = cardNumber
      .replace(/\s+/g, '')
      .replace(/-/g, '');
    return crypto
      .createHash('sha256')
      .update(normalizedCardNumber)
      .digest('hex');
  }
}
