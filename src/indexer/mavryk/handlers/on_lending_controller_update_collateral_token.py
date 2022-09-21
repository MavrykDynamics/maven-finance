
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_token_metadata
from mavryk.types.lending_controller.parameter.update_collateral_token import UpdateCollateralTokenParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage, TokenTypeItem3 as fa12, TokenTypeItem4 as fa2, TokenTypeItem5 as tez
import mavryk.models as models

async def on_lending_controller_update_collateral_token(
    ctx: HandlerContext,
    update_collateral_token: Transaction[UpdateCollateralTokenParameter, LendingControllerStorage],
) -> None:

    # Get operation info
    lending_controller_address      = update_collateral_token.data.target_address
    collateral_token_name           = update_collateral_token.parameter.tokenName
    if collateral_token_name in update_collateral_token.storage.collateralTokenLedger:
        collateral_token_storage        = update_collateral_token.storage.collateralTokenLedger[collateral_token_name]
        collateral_token_oracle_type    = collateral_token_storage.oracleType
        collateral_token_oracle_address = collateral_token_storage.oracleAddress
        collateral_token_address        = collateral_token_storage.tokenContractAddress
        collateral_token_id             = 0

        # Oracle 
        if collateral_token_oracle_type == "cfmm":
            collateral_token_oracle_type  = models.OracleType.CFMM
        elif collateral_token_oracle_type == "oracle":
            collateral_token_oracle_type  = models.OracleType.ORACLE

        # Persist collateral Token Metadata
        await persist_token_metadata(
            ctx=ctx,
            token_address=collateral_token_address,
            token_id=str(collateral_token_id)
        )

        # Create / Update record
        lending_controller          = await models.LendingController.get(
            address = lending_controller_address
        )
        oracle, _                   = await models.MavrykUser.get_or_create(
            address = collateral_token_oracle_address
        )
        await oracle.save()
        lending_controller_collateral_token, _  = await models.LendingControllerCollateralToken.get_or_create(
            lending_controller  = lending_controller,
            token_address       = collateral_token_address,
            oracle              = oracle,
            oracle_type         = collateral_token_oracle_type
        )
        await lending_controller_collateral_token.save()
