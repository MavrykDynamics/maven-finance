from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.set_product_lambda import SetProductLambdaParameter, FarmTypeItem as Farm, FarmTypeItem1 as MFarm
from mavryk.types.farm_factory.storage import FarmFactoryStorage
import mavryk.models as models

async def on_farm_factory_set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: Transaction[SetProductLambdaParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation values
        contract_address        = set_product_lambda.data.target_address
        timestamp               = set_product_lambda.data.timestamp
        lambda_bytes            = set_product_lambda.parameter.func_bytes
        lambda_name             = set_product_lambda.parameter.name
        farm_type               = type(set_product_lambda.parameter.farmType)
    
        # Save / Update record
        contract                = await models.FarmFactory.get(
            address     = contract_address
        )
        contract.last_updated_at            = timestamp
        await contract.save()
        contract_lambda         = None
        if farm_type == Farm:
            contract_lambda, _  = await models.FarmFactoryFarmLambda.get_or_create(
                contract        = contract,
                lambda_name     = lambda_name,
            )
        elif farm_type == MFarm:
            contract_lambda, _  = await models.FarmFactoryMFarmLambda.get_or_create(
                contract        = contract,
                lambda_name     = lambda_name,
            )
        if contract_lambda:
            contract_lambda.last_updated_at     = timestamp
            contract_lambda.lambda_bytes        = lambda_bytes
            await contract_lambda.save()

    except BaseException:
         await save_error_report()

