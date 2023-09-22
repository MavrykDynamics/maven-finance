from mavryk.utils.error_reporting import save_error_report

from mavryk.types.mvk_token.tezos_parameters.transfer import TransferParameter
from dipdup.context import HandlerContext
from mavryk.types.mvk_token.tezos_storage import MvkTokenStorage
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def transfer(
    ctx: HandlerContext,
    transfer: TzktTransaction[TransferParameter, MvkTokenStorage],
) -> None:

    try:
        # Get transfer batch
        transaction_batch   = transfer.parameter.__root__
        timestamp           = transfer.data.timestamp
        level               = int(transfer.data.level)
        mvk_address         = transfer.data.target_address
        user_ledger         = transfer.storage.ledger
        mvk_total_supply    = float(transfer.storage.totalSupply)
    
        # Get MVK Token
        mvk_token = await models.MVKToken.get(network=ctx.datasource.network, address=mvk_address)
    
        for entry in transaction_batch:
            sender_address = entry.from_
            transactions = entry.txs
    
            # Get or create sender
            sender    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=sender_address)
            sender.mvk_balance = user_ledger[sender_address]
            await sender.save()
    
            for transaction in transactions:
                receiver_address = transaction.to_
                amount = int(transaction.amount)
    
                # Get or create receiver
                receiver    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=receiver_address)
                receiver.mvk_balance = user_ledger[receiver_address]
                await receiver.save()
    
                # Create transfer
                transfer_record = models.MVKTokenTransferHistoryData(
                    timestamp=timestamp,
                    mvk_token=mvk_token,
                    from_=sender,
                    to_=receiver,
                    amount=amount
                )
                await transfer_record.save()
    
                # Check if doorman
                doorman_sender      = await models.Doorman.get_or_none(network=ctx.datasource.network, address= sender_address)
                doorman_receiver    = await models.Doorman.get_or_none(network=ctx.datasource.network, address= receiver_address)
                if doorman_sender or doorman_receiver:
                    smvk_total_supply   = 0
                    doorman             = None
                    if doorman_sender:
                        smvk_total_supply   = float(transfer.storage.ledger[sender_address])
                        doorman             = doorman_sender
                    else:
                        smvk_total_supply   = float(transfer.storage.ledger[receiver_address])
                        doorman             = doorman_receiver
                    smvk_users          = await models.MavrykUser.filter(smvk_balance__gt=0).count()
                    
                    if smvk_users > 0:
                        avg_smvk_per_user       = float(smvk_total_supply) / float(smvk_users)
                        smvk_history_data, _    = await models.SMVKHistoryData.get_or_create(
                            timestamp           = timestamp,
                            doorman             = doorman,
                            level               = level
                        )
                        smvk_history_data.smvk_total_supply     = smvk_total_supply
                        smvk_history_data.mvk_total_supply      = mvk_total_supply
                        smvk_history_data.avg_smvk_per_user     = avg_smvk_per_user
                        await smvk_history_data.save()

    except BaseException as e:
        await save_error_report(e)

