import fs from 'fs';
import path from 'path';

// Path to your env.js file
const envFilePath = path.join(__dirname, '..', 'env.js');

// Function to update the contract address in env.js
const updateEnvContracts = (network, contractName, newAddress) => {
    // Dynamically require the env.js file
    const envConfig = require(envFilePath);

    // Check if the network and contract name exist
    if (envConfig.contracts && envConfig.contracts[network] && envConfig.contracts[network].hasOwnProperty(contractName)) {
        // Update the contract address
        envConfig.contracts[network][contractName] = newAddress;

        // Convert the updated object to valid JavaScript code
        const updatedContent = `
const { bob } = require("./scripts/sandbox/accounts");

module.exports = ${JSON.stringify(envConfig, null, 4)};
        `;

        // Write the updated content back to the env.js file
        fs.writeFile(envFilePath, updatedContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing to env.js file:', err);
            } else {
                console.log(`Contract address for ${contractName} on ${network} updated to ${newAddress}.`);
            }
        });
    } else {
        console.error('Invalid network or contract name specified.');
    }
};

module.exports = updateEnvContracts;
