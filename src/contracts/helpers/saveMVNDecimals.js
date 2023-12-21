const { outputFile } = require('fs-extra');

module.exports = async (decimals) => {
    await outputFile(
        `${process.cwd()}/helpers/mvnTokenDecimals.json`,
        `{ "decimals" : "${decimals}" }`
    );
};