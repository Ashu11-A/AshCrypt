type AlgorithmOptions = {
  name: string
  chunkSize: number
}

export abstract class BaseAlgorithm {
  public readonly name: string
  public readonly chunkSize: number

  constructor ({ name, chunkSize }: AlgorithmOptions) {
    this.name = name
    this.chunkSize = chunkSize
  }

  abstract getChunkSize(baseChunkSize: number): number
  abstract encrypt(buffer: Buffer<ArrayBufferLike>): Promise<Buffer<ArrayBuffer>>
  abstract decrypt(cipher: Buffer<ArrayBufferLike>): Promise<Buffer<ArrayBuffer>>
}