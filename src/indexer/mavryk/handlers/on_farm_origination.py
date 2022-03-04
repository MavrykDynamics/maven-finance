from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
import mavryk.models as models

async def on_farm_origination(
    ctx: HandlerContext,
    farm_origination: Origination[FarmStorage],
) -> None:
    # Get farm data
    farmAddress = farm_origination.data.originated_contract_address
    farmLPTokenAddress = farm_origination.storage.lpToken.tokenAddress
    farmLPBalance = farm_origination.storage.lpToken.tokenBalance
    farmOpen = farm_origination.storage.open
    farmInitBlock = int(farm_origination.storage.initBlock)
    farmLastBlockUpdate = int(farm_origination.storage.lastBlockUpdate)
    farmAccumulatedMvkPerShare = float(farm_origination.storage.accumulatedMVKPerShare)
    farmTotalBlocks = int(farm_origination.storage.plannedRewards.totalBlocks)
    farmRewardPerBlock = int(farm_origination.storage.plannedRewards.currentRewardPerBlock)
    farmBlocksPerMinute = int(farm_origination.storage.blocksPerMinute)
    farmInfinite = farm_origination.storage.infinite
    farmDepositPaused = farm_origination.storage.breakGlassConfig.depositIsPaused
    farmWithdrawPaused = farm_origination.storage.breakGlassConfig.withdrawIsPaused
    farmClaimPaused = farm_origination.storage.breakGlassConfig.claimIsPaused
    farmRewardFromTreasury = farm_origination.storage.forceRewardFromTransfer
    farmFactory = None
    if 'farmFactory' in farm_origination.storage.whitelistContracts:
        farmFactoryAddress = farm_origination.storage.whitelistContracts['farmFactory']
        farmFactory = await models.FarmFactory.get_or_none(address=farmFactoryAddress)

    # Create farm object
    farm = models.Farm(
        address                         = farmAddress,
        lp_token                        = farmLPTokenAddress,
        lp_balance                      = farmLPBalance,
        open                            = farmOpen,
        rewards_from_treasury           = farmRewardFromTreasury,
        init_block                      = farmInitBlock,
        last_block_update               = farmLastBlockUpdate,
        accumulated_mvk_per_share       = farmAccumulatedMvkPerShare,
        total_blocks                    = farmTotalBlocks,
        reward_per_block                = farmRewardPerBlock,
        blocks_per_minute               = farmBlocksPerMinute,
        infinite                        = farmInfinite,
        deposit_paused                  = farmDepositPaused,
        withdraw_paused                 = farmWithdrawPaused,
        claim_paused                    = farmClaimPaused,
        farm_factory                    = farmFactory
    )
    await farm.save()