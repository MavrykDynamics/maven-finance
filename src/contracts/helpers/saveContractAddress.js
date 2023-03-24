const { outputFile } = require('fs-extra');

module.exports = async (name, address) => {
    
    // console log contract name in Title Case
    const rawName = name.substring(0, name.length - 7);
    const addSpaces = rawName.replace(/([A-Z])/g, " $1");
    const contractName = addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);
    console.log(`${contractName} contract deployed at: ${address}`)

    await outputFile(
        `${process.cwd()}/deployments/${name}.json`,
        `{ "address" : "${address}"}`
    );
    
};