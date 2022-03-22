import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { alice } from '../../scripts/sandbox/accounts'

export type vaultStorageType = {
  admin                       : string;
  handle                      : {};
  depositors                  : MichelsonMap<MichelsonMapKey, unknown>;
  collateralTokenAddresses    : MichelsonMap<MichelsonMapKey, unknown>;
}
