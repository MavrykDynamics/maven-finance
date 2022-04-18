import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type farmStorageType = {
  admin                     : string;
  mvkTokenAddress           : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

  config                    : {
                                lpToken : {
                                  tokenAddress  : String;
                                  tokenId       : BigNumber;
                                  tokenStandard : {};
                                  tokenBalance  : BigNumber;
                                },

                                tokenPair : {
                                  token0Address : String;
                                  token1Address : String;
                                },

                                infinite                : Boolean;
                                forceRewardFromTransfer : Boolean;
                                blocksPerMinute         : BigNumber;

                                plannedRewards : {
                                  totalBlocks           : BigNumber;
                                  currentRewardPerBlock : BigNumber;
                                  totalRewards          : BigNumber;
                                }

                              }

  generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;

  breakGlassConfig          : {
                                depositIsPaused   : boolean
                                withdrawIsPaused  : boolean;
                                claimIsPaused     : boolean;
                              }

  lastBlockUpdate           : BigNumber;
  accumulatedMVKPerShare    : BigNumber;
  claimedRewards            : {
                                unpaid : BigNumber;
                                paid   : BigNumber;
                              }
  delegators                : MichelsonMap<MichelsonMapKey, unknown>;
  open                      : Boolean;
  init                      : Boolean;
  initBlock                 : BigNumber;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
};