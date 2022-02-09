const { outputFile } = require('fs-extra');

module.exports = async (name, address) => {
    await outputFile(
        `${process.cwd()}/deployments/${name}.js`,
        `module.exports = "${address}";`
    );
};