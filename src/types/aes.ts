import { type CipherGCMTypes } from 'crypto';

export type AESOptions = {
  secret: string,
  chunkSize?: number,
  algorithm?: CipherGCMTypes
  iterations?: number
}