enum HashFunction {
  Sha256 = 'SHA-256',
  Sha384 = 'SHA-384',
  Sha512 = 'SHA-512',
}; 

async function digestText(
  text: string, 
  hashFunction: HashFunction = HashFunction.Sha256
){
  const 
  msgUint8 = new TextEncoder().encode(text), // encode as (utf-8) Uint8Array
  hashBuffer = await window.crypto.subtle.digest(hashFunction, msgUint8), // hash the message
  hashArray = Array.from(new Uint8Array(hashBuffer)), // convert buffer to byte array
  hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string

  return hashHex;
}

export {HashFunction, digestText};
