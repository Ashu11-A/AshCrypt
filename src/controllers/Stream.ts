import { createReadStream, createWriteStream, WriteStream } from "fs";
import { Transform } from "stream";
import type { BaseAlgorithm } from "../crypt/base";
import transform from 'parallel-transform'
import type { StreamOptions } from "../types/stream";

export class Stream<Algorithm extends BaseAlgorithm> {
  readonly algorithm: Algorithm;
  readonly parallel: number = 1

  constructor({ algorithm, maxParallel }: StreamOptions<Algorithm>) {
    this.algorithm = algorithm;
    if (maxParallel) this.parallel = maxParallel
  }

  /**
   * Creates a Transform stream for encryption/decryption with proper chunk sizes
   */
  create(type: "decrypt" | "encrypt"): Transform {
    const algorithm = this.algorithm;
    const originalChunkSize = algorithm.chunkSize;
    const encryptedChunkSize = algorithm.getChunkSize(originalChunkSize);

    // Set chunk sizes based on operation type
    const [writableSize, readableSize] = type === "encrypt"
      ? [originalChunkSize, encryptedChunkSize]
      : [encryptedChunkSize, originalChunkSize];

    return transform(this.parallel, {
      ordered: true,
      writableHighWaterMark: writableSize,
      readableHighWaterMark: readableSize,
      },
      (chunk: Buffer, callback) => {
        algorithm[type](chunk)
          .then(result => callback(null, result))
          .catch(err => callback(err));
      })
  }

  /**
   * Reads an encrypted file and returns a decrypted stream
   */
  read(path: string, type: "decrypt" | "encrypt"): Transform {
    const encryptedChunkSize = this.algorithm.getChunkSize(this.algorithm.chunkSize);
    const transform = this.create(type);
    const readStream = createReadStream(path, {
      highWaterMark: type === 'decrypt'
        ? encryptedChunkSize
        : this.algorithm.chunkSize
    });

    return readStream.pipe(transform);
  }

  /**
   * Returns a Transform stream that encrypts data and writes to the specified path
   */
  write(path: string): WriteStream {

    return createWriteStream(path);
  }
}