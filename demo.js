// Import bcryptjs
const bcrypt = require('bcryptjs');

// Password to hash
const password = "123456";

// Salt rounds
const SALT_ROUNDS = 10;

async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    console.log("Original Password:", password);
    console.log("Hashed Password:", hashedPassword);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run function
hashPassword();