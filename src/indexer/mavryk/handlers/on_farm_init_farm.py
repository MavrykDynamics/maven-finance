
from mavryk.types.farm.parameter.init_farm import InitFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_init_farm(
    ctx: HandlerContext,
    init_farm: Transaction[InitFarmParameter, FarmStorage],
) -> None:
# Get farm data
    farmAddress = init_farm.data.target_address
    farmLPTokenAddress = init_farm.storage.lpToken.tokenAddress
    farmLPBalance = init_farm.storage.lpToken.tokenBalance
    farmOpen = init_farm.storage.open
    farmLastBlockUpdate = int(init_farm.storage.lastBlockUpdate)
    farmAccumulatedMvkPerShare = float(init_farm.storage.accumulatedMVKPerShare)
    farmTotalBlocks = int(init_farm.storage.plannedRewards.totalBlocks)
    farmRewardPerBlock = int(init_farm.storage.plannedRewards.currentRewardPerBlock)
    farmBlocksPerMinute = int(init_farm.storage.blocksPerMinute)
    farmInfinite = init_farm.storage.infinite
    farmDepositPaused = init_farm.storage.breakGlassConfig.depositIsPaused
    farmWithdrawPaused = init_farm.storage.breakGlassConfig.withdrawIsPaused
    farmClaimPaused = init_farm.storage.breakGlassConfig.claimIsPaused
    farmRewardFromTreasury = init_farm.storage.forceRewardFromTransfer

    # Create farm object
    farm = await models.Farm.get(
        address = farmAddress,
    )
    farm.address                         = farmAddress
    farm.lp_token                        = farmLPTokenAddress
    farm.lp_balance                      = farmLPBalance
    farm.open                            = farmOpen
    farm.rewards_from_treasury           = farmRewardFromTreasury
    farm.last_block_update               = farmLastBlockUpdate
    farm.accumulated_mvk_per_share       = farmAccumulatedMvkPerShare
    farm.total_blocks                    = farmTotalBlocks
    farm.reward_per_block                = farmRewardPerBlock
    farm.blocks_per_minute               = farmBlocksPerMinute
    farm.infinite                        = farmInfinite
    farm.deposit_paused                  = farmDepositPaused
    farm.withdraw_paused                 = farmWithdrawPaused
    farm.claim_paused                    = farmClaimPaused
    await farm.save()