const fs = require('fs');

// Fix special characters in regex string
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Format stdin args for pascaligo
function formatArgs(type, lambdaVar){
    switch(type){
        case "nat":
            return lambdaVar + "n";
            break;
        case "bool":
            // TODO: Throw error
            return lambdaVar.toUpperCase() === "TRUE" ? "True" : "False";
            break;
        case "string":
            return "\""+lambdaVar+"\"";
            break;
        default: 
            return undefined;
    }
}

// Path of the input and output file
const inputFile = '/Users/tristanallaire/Projekt/Mavryk/mavryk-dapp/src/contracts/contracts/main/test_template.ligo';
const outputFile = '/Users/tristanallaire/Projekt/Mavryk/mavryk-dapp/src/contracts/contracts/main/test_template_output.ligo';

// Read the contents of the input file specified in the first command line argument
const lambdaFunctionUsed = process.argv[2];

// Read the contents of the input file
fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) throw err;

    // Find all words starting with "${" and ending with "}"
    const regex = /\$\{.*?\}/g;
    const matches = data.match(regex);

    // Print the matched words
    if (matches) {
        console.log('Matches found:');
        console.log(matches);
    } else {
        console.log('No matches found.');
    }

    // Find all words starting with "function " and ending with "("
    const functionRegex = /function\s+\w+\s*\(/g;
    const functionNames = data.match(functionRegex);

    // Print the matched words
    var modifiedData = "";
    if (functionNames) {
        const functionNamesFixed = [];
        functionNames.forEach(functionName => {
            var functionNameFixed   = functionName.replace('function ', '').replace(' (', '');
            functionNamesFixed.push(functionNameFixed)
        });
        if(functionNamesFixed.includes(lambdaFunctionUsed)){
            // Replace words in the text
            const regex     = new RegExp(escapeRegExp("${LAMBDA_FUNCTION}").trim(), 'g')
            modifiedData    = data.replace(regex, lambdaFunctionUsed+"()");

            const lambdaFunctionRelatedVars = []
            matches.forEach(match => {
                // Only print related variables
                if(match.startsWith("${"+lambdaFunctionUsed.toUpperCase())){
                    lambdaFunctionRelatedVars.push(match);
                }
            });
            const expectedParameterLength   = lambdaFunctionRelatedVars.length + 3;

            // Check the correct amount of parameters
            if(expectedParameterLength != process.argv.length){
                console.log("This lambda function expects more parameter in stdin.");
                console.log("List of expected parameters:");

                lambdaFunctionRelatedVars.forEach(lambdaFunctionRelatedVar => {
                    console.log(lambdaFunctionRelatedVar.replace("${" + lambdaFunctionUsed.toUpperCase() + '_', '').replace("}", ''))
                });
            } else {
                var argIndex    = 3;
                lambdaFunctionRelatedVars.forEach(lambdaFunctionRelatedVar => {
                    console.log(lambdaFunctionRelatedVar)
                    const regex     = new RegExp(escapeRegExp(lambdaFunctionRelatedVar).trim(), 'g')
                    console.log(regex)

                    // Format the variable properly
                    const typeRegex     = /:.*?\}/g;
                    const type          = lambdaFunctionRelatedVar.match(typeRegex);
                    const formattedType = type[0].replace(': ', '').replace('}', '')
                    
                    const formattedVar  = formatArgs(formattedType, process.argv[argIndex]);

                    modifiedData    = modifiedData.replace(regex, formattedVar);
                    argIndex++;
                });
            }

        } else{
            console.log('Lambda function not found.');
        }
    } else {
        console.log('No matches found.');
    }

    // Write the result to the output file
    fs.writeFile(outputFile, modifiedData, (err) => {
        if (err) throw err;
        console.log('The file was saved successfully!');
    });
});

