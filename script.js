const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Read JSON data from file
const rawData = fs.readFileSync('sonic-tokenlist.json');
const parsedData = JSON.parse(rawData);

// Ensure the structure has a 'tokens' array
if (!parsedData.tokens || !Array.isArray(parsedData.tokens)) {
  console.error("Error: 'tokens' array not found in JSON file");
  process.exit(1);
}

// Directory to save logos
const logoDir = path.join(__dirname, 'sonic-logos');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Function to download and save logos
const downloadLogos = async () => {
  for (const token of parsedData.tokens) {
    const logoURL = token.logoURI;
    const logoPath = path.join(logoDir, `${token.address}.png`);
    
    try {
      const response = await axios({ url: logoURL, responseType: 'stream' });
      const writer = fs.createWriteStream(logoPath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      console.log(`Saved: ${logoPath}`);
    } catch (error) {
      console.error(`Failed to download logo for ${token.address}:`, error.message);
    }
  }

  // Update logoURI to the new path
  const updatedTokens = parsedData.tokens.map(token => ({
    ...token,
    logoURI: `https://raw.githubusercontent.com/9mm-exchange/app-tokens/main/sonic-logos/${token.address}.png`
  }));

  // Save the updated JSON back to a file
  fs.writeFileSync('updated_tokens.json', JSON.stringify({ tokens: updatedTokens }, null, 2));
  console.log('Updated JSON saved to updated_tokens.json');
};

// Run the script
downloadLogos();
