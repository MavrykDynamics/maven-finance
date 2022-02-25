const { outputFile } = require('fs-extra');

module.exports = async (decimals) => {
    await outputFile(
        `${process.cwd()}/helpers/mvkTokenDecimals.json`,
        `{ "decimals" : "${decimals}" }`
    );
};