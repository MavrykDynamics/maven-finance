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

    # Create farm object
    farm, _ = await models.Farm.get_or_create(
        address = farmAddress
    )
    farm.lp_token                        = farmLPTokenAddress
    farm.lp_balance                      = farmLPBalance
    farm.open                            = farmOpen
    farm.rewards_from_treasury           = farmRewardFromTreasury
    farm.init_block                      = farmInitBlock
    farm.last_block_update               = farmLastBlockUpdate
    farm.accumulated_mvk_per_share       = farmAccumulatedMvkPerShare
    farm.total_blocks                    = farmTotalBlocks
    farm.reward_per_block                = farmRewardPerBlock
    farm.blocks_per_minute               = farmBlocksPerMinute
    farm.infinite                        = farmInfinite
    farm.deposit_paused                  = farmDepositPaused
    farm.withdraw_paused                 = farmWithdrawPaused
    farm.claim_paused                    = farmClaimPaused

    if 'farmFactory' in farm_origination.storage.whitelistContracts:
        farmFactoryAddress = farm_origination.storage.whitelistContracts['farmFactory']
        farmFactory = await models.FarmFactory.get_or_none(address=farmFactoryAddress)
        farm.farm_factory                = farmFactory
    
    await farm.save()