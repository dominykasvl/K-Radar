const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

function encrypt(text, secretKey) {
  let iv = crypto.randomBytes(16);
  let hash = crypto.createHash('sha256');
  hash.update(secretKey);
  let hashedKey = hash.digest();

  let cipher = crypto.createCipheriv('aes-256-cbc', hashedKey, iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString('hex'), encrypted: encrypted.toString('hex') };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter your string to encrypt: ', (apiKey) => {
  rl.question('Please enter your secret key: ', (secretKey) => {
    rl.question('Please enter a tag for the file names: ', (tag) => {
      let { iv, encrypted } = encrypt(apiKey, secretKey);
      fs.writeFileSync(`AES/iv_${tag}.txt`, iv); // Save IV to a file
      fs.writeFileSync(`AES/encrypted_${tag}.txt`, encrypted); // Save encrypted API key to a file
      console.log('Encryption complete. Files saved.');
      rl.close();
    });
  });
});