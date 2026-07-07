#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACCOUNT_COUNT="${1:-6}"
JSON_FILE="${2:-$SCRIPT_DIR/test/helpers/mavryk-oracle-accounts.generated.json}"

if ! [[ "$ACCOUNT_COUNT" =~ ^[0-9]+$ ]] || [ "$ACCOUNT_COUNT" -lt 1 ]; then
    echo "Usage: $0 [account_count] [output_json_file]"
    echo "account_count must be a positive integer"
    exit 1
fi

mkdir -p "$(dirname "$JSON_FILE")"

cd "$SCRIPT_DIR"
node - "$ACCOUNT_COUNT" "$JSON_FILE" <<'NODE'
const crypto = require('crypto');
const fs = require('fs');
const { generateSecretKey, InMemorySigner } = require('@mavrykdynamics/taquito-signer');

const [accountCountArg, outputFile] = process.argv.slice(2);
const accountCount = Number(accountCountArg);

async function generateAccount(index) {
  const seed = crypto.randomBytes(64);
  const derivationPath = `m/44'/1729'/${index}'/0'`;
  const sk = generateSecretKey(seed, derivationPath, 'ed25519');
  const signer = await InMemorySigner.fromSecretKey(sk);

  return {
    pkh: await signer.publicKeyHash(),
    pk: await signer.publicKey(),
    sk,
    peerId: `oracle-peer-${index + 1}`,
  };
}

(async () => {
  const accounts = [];
  for (let index = 0; index < accountCount; index += 1) {
    accounts.push(await generateAccount(index));
  }

  fs.writeFileSync(outputFile, `${JSON.stringify(accounts, null, 2)}\n`);
  console.log(`Generated ${accounts.length} Mavryk account(s) in ${outputFile}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE
