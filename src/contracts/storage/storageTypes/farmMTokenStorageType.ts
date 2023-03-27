import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type farmMTokenStorageType = {

  admin                     : string;
  mvkTokenAddress           : string;
  governanceAddress         : string;
  name                      : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
  config                    : {
                                lpToken : {
                                  tokenAddress  : String;
                                  tokenId       : BigNumber;
                                  tokenStandard : {};
                                  tokenBalance  : BigNumber;
                                },

                                loanToken               : string,
                                infinite                : Boolean;
                                forceRewardFromTransfer : Boolean;

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
  accumulatedRewardsPerShare    : BigNumber;
  claimedRewards            : {
                                unpaid : BigNumber;
                                paid   : BigNumber;
                              }
  depositorLedger           : MichelsonMap<MichelsonMapKey, unknown>;
  open                      : Boolean;
  init                      : Boolean;
  initBlock                 : BigNumber;

  minBlockTimeSnapshot              : BigNumber;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

};