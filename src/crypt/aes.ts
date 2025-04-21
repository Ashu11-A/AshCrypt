import { createCipheriv, createDecipheriv, pbkdf2, randomBytes, type CipherGCMTypes } from 'crypto';
import type { AESOptions } from '../types/aes';
import { BaseAlgorithm } from './base';

export class AES extends BaseAlgorithm {
  readonly IV_LENGTH: number = 12;
  readonly TAG_LENGTH: number = 16;
  readonly SALT_LENGTH: number
  readonly TAG_POSITION: number
  readonly ENCRYPTED_POSITION: number
  readonly KEYLEN: number
  readonly HASH: string

  readonly algorithm: CipherGCMTypes
  private readonly secret: string
  readonly iterations: number

  constructor({ secret, chunkSize = 512 * 1000, algorithm = 'aes-256-gcm', iterations = 100000 }: AESOptions) {
    super({ name: algorithm, chunkSize })

    this.algorithm = algorithm
    this.secret = secret
    this.iterations = iterations

    this.SALT_LENGTH = this.algorithm.includes("128")
    ? 16
    : this.algorithm.includes("192")
      ? 16
      : 32
    this.KEYLEN = this.algorithm.includes("128")
      ? 16
      : this.algorithm.includes("192")
        ? 24
        : 32
    this.HASH = this.algorithm.includes("128")
      ? 'sha256'
      : this.algorithm.includes("192")
        ? 'sha384'
        : 'sha512'

    this.TAG_POSITION = this.SALT_LENGTH + this.IV_LENGTH
    this.ENCRYPTED_POSITION = this.TAG_POSITION + this.TAG_LENGTH
  }

  getKey(salt: Buffer) {
    return new Promise<Error | Buffer<ArrayBufferLike>>((resolve, reject) =>
      pbkdf2(
        this.secret,
        salt,
        this.iterations,
        this.KEYLEN,
        this.HASH,
        (err, derivedKey) => {
          if (err) return reject(err)
          resolve(derivedKey)
        })
      );
  }

  getChunkSize(baseChunkSize: number) {
    return baseChunkSize + this.ENCRYPTED_POSITION
  }

  async encrypt(buffer: Buffer<ArrayBufferLike>): Promise<Buffer<ArrayBuffer>> {
    const iv = randomBytes(this.IV_LENGTH);
    const salt = randomBytes(this.SALT_LENGTH);
  
    const key = await this.getKey(salt);
    if (key instanceof Error) throw key

    const cipher = createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final(),
    ]);
    
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted])
  }

  async decrypt(cipher: Buffer<ArrayBufferLike>): Promise<Buffer<ArrayBuffer>> {
    if (cipher.length < this.ENCRYPTED_POSITION) {
      throw new Error("Invalid ciphertext buffer");
    }

    const salt = cipher.subarray(0, this.SALT_LENGTH);
    const iv = cipher.subarray(this.SALT_LENGTH, this.TAG_POSITION);
    const tag = cipher.subarray(this.TAG_POSITION, this.ENCRYPTED_POSITION);
    const encrypted = cipher.subarray(this.ENCRYPTED_POSITION);

    const key = await this.getKey(salt);
    if (key instanceof Error) throw key

    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()])
  }
}