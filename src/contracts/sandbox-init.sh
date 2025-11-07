#!/bin/bash
MAIN_SANDBOX_V="e072107c"
APPLE_SANDBOX_V="e072107c"
TZ_NODE_VERSION=$(docker exec -it mavryk-sandbox mavkit-node --version)
NODE_BOOTSTRAPPED=$(docker exec -it mavryk-sandbox mavkit-client bootstrapped)
echo $TZ_NODE_VERSION
until [[ "$TZ_NODE_VERSION" == *"$MAIN_SANDBOX_V"* && "$NODE_BOOTSTRAPPED" == *"Node is bootstrapped."* ]] || [[ "$TZ_NODE_VERSION" == *"$APPLE_SANDBOX_V"* && "$NODE_BOOTSTRAPPED" == *"Node is bootstrapped."* ]];
do
  echo "Waiting for Mavryk Node to finish starting up......"
  sleep 10
  TZ_NODE_VERSION=$(docker exec -it mavryk-sandbox mavkit-node --version)
  NODE_BOOTSTRAPPED=$(docker exec -it mavryk-sandbox mavkit-client bootstrapped)

  if [[ "$TZ_NODE_VERSION" == *"$MAIN_SANDBOX_V"* && "$NODE_BOOTSTRAPPED" == *"Node is bootstrapped."* ]] || [[ "$TZ_NODE_VERSION" == *"$APPLE_SANDBOX_V"* && "$NODE_BOOTSTRAPPED" == *"Node is bootstrapped."* ]]; then
    echo "Tezos Node is ready"
    TZ_NODE_VERSION=$(docker exec -it mavryk-sandbox mavkit-node --version)
    echo "Flexmasa Tezos Node version $TZ_NODE_VERSION"
    break
  fi
done
docker exec -it mavryk-sandbox mavkit-client import secret key eve unencrypted:edsk3QbYXUV92sMoLyMtUSHr4ymkVBWMWUsiG9Z2DuPhvFNPHrKM5B
docker exec -it mavryk-sandbox mavkit-client import secret key mallory unencrypted:edsk3bVbowf9hFpdk8mAjZ8qSKzRTcFTgfqdoY4txdQrUhGHJGruXB
docker exec -it mavryk-sandbox mavkit-client import secret key oscar unencrypted:edsk32TqRuUFWHE6jwrPgbk5M9A3Sbs4shY4dh1WJCMR1fJjoV6iNs
docker exec -it mavryk-sandbox mavkit-client import secret key trudy unencrypted:edsk3AbmsisVnZtkyVvY1jkyNpSTcRhW3hepihBLTu6e5sUaTS2x1c
docker exec -it mavryk-sandbox mavkit-client import secret key isaac unencrypted:edsk3ahGaSWjzjHuS7mK5Bsy7LxH8iTRXpGcMvzjgSypKHKw2wrq1u
docker exec -it mavryk-sandbox mavkit-client import secret key david unencrypted:edsk3hwth6tL9hppsUT6sZQ5687DDY9GPgKiZgjg9DDcMjJxoRUsGc
docker exec -it mavryk-sandbox mavkit-client import secret key susie unencrypted:edsk2vtJ2rVoHoA3GbgDjyT5zbeVMDXZ6R4YjDskKaapgsRtiEWpaP
docker exec -it mavryk-sandbox mavkit-client import secret key ivan unencrypted:edsk4AzUdwSFu383eMf8eve56Q2pJxy1eWt4BnzKkLKMdKurHgTeaf
docker exec -it mavryk-sandbox mavkit-client import secret key astronaut unencrypted:edskSA1MhTp6Eq3T79MEP822eXAmxXBk89eFYGgwBsJjfyUHDGsYfudasQocwcb5DUEMvA1B3EsvxCZ8G6Wek6syxAA49DEKzq
docker exec -it mavryk-sandbox mavkit-client import secret key gagarine unencrypted:edskS5Xd6CDBLbuJwkaa7mT2K6mom4odhbBiS3bxDtAB1crXWj4gwKF5oQsN9aijR3CNpr7cZXxcoUU32vqm67W3MRGSTVzMmz
docker exec -it mavryk-sandbox mavkit-client import secret key armstrong unencrypted:edskRvgMBH37Dci9isEHcdsHQ4ioPdUq3AfXDiAj3ZXiuy3YMs4LEUiZVMaSG9KjTFo78LidgZkdVbkXUamMK2or8UAxB743SH

docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to eve --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to mallory --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to oscar --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to trudy --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to isaac --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to david --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to susie --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to ivan --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 5000 from alice to astronaut --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to gagarine --burn-cap 0.06425
docker exec -it mavryk-sandbox mavkit-client transfer 2000 from alice to armstrong --burn-cap 0.06425

docker exec -it mavryk-sandbox mavkit-client list known addresses

# Restart indexer container (needed sometimes)
docker restart contracts-indexer-1
