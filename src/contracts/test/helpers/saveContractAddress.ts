import fs from 'fs';

const contractDeployments        = fs.readFileSync("./test/contractDeployments.json");
const parsedContractDeployments  = JSON.parse(contractDeployments.toString());

module.exports = async (name, address, consoleLogBool = true ? true : false) => {

    // console log contract name in Title Case
    const rawContractName       = name.substring(0, name.length - 7);
    const addSpaces             = rawContractName.replace(/([A-Z])/g, " $1");
    const contractName          = addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);

    if(consoleLogBool == true){
        console.log(`${contractName} contract deployed at: ${address}`)
    }
    parsedContractDeployments[rawContractName] = {
        'address' : address
    }

    fs.writeFileSync('./test/contractDeployments.json', JSON.stringify(parsedContractDeployments, null, 4));

};