/**
 * @jest-environment node
 */

import { encryptData, decryptData } from "../src/utils.js";

describe("Encryption cycle (Node Web Crypto)", () => {
  const passphrase = "test-passphrase-12345";
  const testData = { key: "value", number: 42, nested: { a: [1, 2, 3] } };

  test("encrypts and decrypts data correctly", async () => {
    const dataStr = JSON.stringify(testData);
    const encrypted = await encryptData(dataStr, passphrase);
    expect(encrypted).toBeTruthy();
    expect(typeof encrypted).toBe("string");
    expect(encrypted.startsWith("#1#")).toBe(true);

    const decrypted = await decryptData(encrypted, passphrase);
    expect(decrypted).toBe(dataStr);
    expect(JSON.parse(decrypted)).toEqual(testData);
  });

  test("different passphrase fails to decrypt", async () => {
    const dataStr = JSON.stringify(testData);
    const encrypted = await encryptData(dataStr, passphrase);
    const wrong = await decryptData(encrypted, "wrong-passphrase-67890");
    expect(wrong).toBeNull();
  });

  test("invalid encrypted data returns null", async () => {
    const result = await decryptData("invalid-data", passphrase);
    expect(result).toBeNull();
    const noPrefix = await decryptData("not-encrypted", passphrase);
    expect(noPrefix).toBeNull();
  });

  test("encrypts and decrypts empty object", async () => {
    const dataStr = JSON.stringify({});
    const encrypted = await encryptData(dataStr, passphrase);
    const decrypted = await decryptData(encrypted, passphrase);
    expect(JSON.parse(decrypted)).toEqual({});
  });

  test("encrypts and decrypts array data", async () => {
    const dataStr = JSON.stringify([1, "two", { three: 3 }]);
    const encrypted = await encryptData(dataStr, passphrase);
    const decrypted = await decryptData(encrypted, passphrase);
    expect(JSON.parse(decrypted)).toEqual([1, "two", { three: 3 }]);
  });

  test("encrypted output differs each time (random salt/iv)", async () => {
    const dataStr = JSON.stringify(testData);
    const enc1 = await encryptData(dataStr, passphrase);
    const enc2 = await encryptData(dataStr, passphrase);
    expect(enc1).not.toBe(enc2);
  });

  test("handles Unicode characters", async () => {
    const dataStr = JSON.stringify({
      uk: "Привіт, світ!",
      emoji: "🏋️‍♂️💪",
      special: "©®™",
    });
    const encrypted = await encryptData(dataStr, passphrase);
    const decrypted = await decryptData(encrypted, passphrase);
    expect(JSON.parse(decrypted)).toEqual({
      uk: "Привіт, світ!",
      emoji: "🏋️‍♂️💪",
      special: "©®™",
    });
  });

  test("long passphrase (100+ chars)", async () => {
    const long = "a".repeat(150);
    const dataStr = JSON.stringify({ test: true });
    const encrypted = await encryptData(dataStr, long);
    const decrypted = await decryptData(encrypted, long);
    expect(JSON.parse(decrypted)).toEqual({ test: true });
  });
});
