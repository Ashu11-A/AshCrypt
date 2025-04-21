<div align="center">

# AshCrypt

![license-info](https://img.shields.io/github/license/Ashu11-A/AshCrypt?style=for-the-badge&colorA=302D41&colorB=f9e2af&logoColor=f9e2af)
![stars-infoa](https://img.shields.io/github/stars/Ashu11-A/AshCrypt?colorA=302D41&colorB=f9e2af&style=for-the-badge)

![Last-Comitt](https://img.shields.io/github/last-commit/Ashu11-A/AshCrypt?style=for-the-badge&colorA=302D41&colorB=b4befe)
![Comitts Year](https://img.shields.io/github/commit-activity/y/Ashu11-A/AshCrypt?style=for-the-badge&colorA=302D41&colorB=f9e2af)
![reposize-info](https://img.shields.io/github/languages/code-size/Ashu11-A/AshCrypt?style=for-the-badge&colorA=302D41&colorB=90dceb)

![SourceForge Languages](https://img.shields.io/github/languages/top/Ashu11-A/AshCrypt?style=for-the-badge&colorA=302D41&colorB=90dceb)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/AshCrypt?style=for-the-badge&colorA=302D41&colorB=3ac97b)

</div>

---

## 📃 Description

**AshCrypt** is a modular and efficient encryption library for handling large files using the **AES-GCM** encryption algorithm. It provides chunked encryption and decryption support using streams for memory-efficient processing, suitable for secure file handling and transmission.

The library divides files into configurable chunks (default 512 KB), encrypts each chunk separately, and appends essential metadata (salt, IV, tag) to each chunk.

---

## ⚙️ Features

- 🔐 AES-GCM encryption (128, 192, or 256-bit)
- 🧩 Configurable chunk size (default: 512KB)
- 📁 Stream-based I/O for large files
- 🔄 Parallel processing support for better performance
- 📦 Easy integration and usage via typed API

---

## 🚀 Installation

```bash
npm install ashcrypt
```

---

## 🧠 Usage

```ts
import { AES, Stream } from 'ashcrypt';

const aes = new AES({ secret: 'my-very-secure-password' });
const stream = new Stream({ algorithm: aes });

// Encrypting a file
stream.read('input.txt', 'encrypt')
  .pipe(stream.write('output.enc'))
  .on('finish', () => {

    // Decrypting a file
    stream.read('output.enc', 'decrypt')
      .pipe(stream.write('decrypted.txt'));
  })

```

---

## 🔐 Class: `AES`

Handles key derivation and encryption/decryption of buffers.

### Constructor

```ts
new AES({ secret, chunkSize, algorithm, iterations });
```

- `secret`: Password or passphrase
- `chunkSize`: (Optional): Default: 512 * 1000 (512KB)
- `algorithm`: (Optional): Default: 'aes-256-gcm'
- `iterations`: (Optional): Default: 100000 (PBKDF2 iterations)

### `getKey(salt: Buffer): Promise<Buffer>`
Derives a key from the given salt using PBKDF2.

### `getChunkSize(baseChunkSize: number): number`
Returns the final size of a chunk after encryption (includes metadata).

### `encrypt(buffer: Buffer): Promise<Buffer>`
Encrypts a single chunk. Appends `salt + iv + tag` to encrypted content.

### `decrypt(buffer: Buffer): Promise<Buffer>`
Decrypts a previously encrypted chunk. Extracts and uses the appended metadata.

---

## 📄 Class: `Stream<Algorithm>`

Provides stream-based encryption/decryption for large files.

### Constructor

```ts
new Stream({ algorithm, maxParallel });
```

- `algorithm`: Instance of AES (or compatible)
- `maxParallel` (optional): Number of parallel chunks to process (default: 1)

### `create(type: "encrypt" | "decrypt"): Transform`
Creates a transform stream for encryption or decryption.

### `read(path: string, type: "encrypt" | "decrypt"): Transform`
Returns a read stream piped through transformation (encryption/decryption).

### `write(path: string): WriteStream`
Returns a write stream to save the final output.

---

## 📦 Chunk Format

Each chunk is encoded as:

```plaintext
[salt (16–32B)][IV (12B)][Auth Tag (16B)][Encrypted Data]
```

- **Salt**: Random bytes used for PBKDF2
- **IV**: Initialization vector
- **Auth Tag**: AES-GCM tag for integrity
- **Encrypted Data**: Ciphertext of the original chunk

---

## 📜 License

Licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">
Made by Matheus Nilton Biolowons
</div>
