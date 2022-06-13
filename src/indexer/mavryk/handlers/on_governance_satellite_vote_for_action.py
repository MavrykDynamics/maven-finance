
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.vote_for_action import VoteForActionParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_vote_for_action(
    ctx: HandlerContext,
    vote_for_action: Transaction[VoteForActionParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()