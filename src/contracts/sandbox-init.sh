#!/bin/bash

sleep 5

docker exec -it mavryk-sandbox tezos-client import secret key eve unencrypted:edsk3QbYXUV92sMoLyMtUSHr4ymkVBWMWUsiG9Z2DuPhvFNPHrKM5B
docker exec -it mavryk-sandbox tezos-client import secret key mallory unencrypted:edsk3bVbowf9hFpdk8mAjZ8qSKzRTcFTgfqdoY4txdQrUhGHJGruXB
docker exec -it mavryk-sandbox tezos-client import secret key oscar unencrypted:edsk32TqRuUFWHE6jwrPgbk5M9A3Sbs4shY4dh1WJCMR1fJjoV6iNs
docker exec -it mavryk-sandbox tezos-client import secret key trudy unencrypted:edsk3AbmsisVnZtkyVvY1jkyNpSTcRhW3hepihBLTu6e5sUaTS2x1c
docker exec -it mavryk-sandbox tezos-client import secret key isaac unencrypted:edsk3ahGaSWjzjHuS7mK5Bsy7LxH8iTRXpGcMvzjgSypKHKw2wrq1u
docker exec -it mavryk-sandbox tezos-client import secret key david unencrypted:edsk3hwth6tL9hppsUT6sZQ5687DDY9GPgKiZgjg9DDcMjJxoRUsGc
docker exec -it mavryk-sandbox tezos-client import secret key susie unencrypted:edsk2vtJ2rVoHoA3GbgDjyT5zbeVMDXZ6R4YjDskKaapgsRtiEWpaP
docker exec -it mavryk-sandbox tezos-client import secret key ivan unencrypted:edsk4AzUdwSFu383eMf8eve56Q2pJxy1eWt4BnzKkLKMdKurHgTeaf

docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to eve --burn-cap 0.06425
docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to mallory --burn-cap 0.06425
docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to oscar --burn-cap 0.06425
docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to trudy --burn-cap 0.06425
docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to isaac --burn-cap 0.06425
docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to david --burn-cap 0.06425
docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to susie --burn-cap 0.06425
docker exec -it mavryk-sandbox tezos-client transfer 200 from alice to ivan --burn-cap 0.06425

docker exec -it mavryk-sandbox tezos-client list known addresses