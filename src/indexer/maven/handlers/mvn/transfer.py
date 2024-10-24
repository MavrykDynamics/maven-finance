from maven.utils.error_reporting import save_error_report

from maven.types.mvn_token.tezos_parameters.transfer import TransferParameter
from dipdup.context import HandlerContext
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def transfer(
    ctx: HandlerContext,
    transfer: TezosTransaction[TransferParameter, MvnTokenStorage],
) -> None:

    try:
        # Get transfer batch
        transaction_batch   = transfer.parameter.root
        timestamp           = transfer.data.timestamp
        level               = int(transfer.data.level)
        mvn_address         = transfer.data.target_address
        user_ledger         = transfer.storage.ledger
        mvn_total_supply    = float(transfer.storage.totalSupply)
    
        # Get MVN Token
        mvn_token = await models.MVNToken.get(network='atlasnet', address=mvn_address)
    
        for entry in transaction_batch:
            sender_address = entry.from_
            transactions = entry.txs
    
            # Get or create sender
            sender    = await models.maven_user_cache.get(network='atlasnet', address=sender_address)
            sender.mvn_balance = user_ledger[sender_address]
            await sender.save()
    
            for transaction in transactions:
                receiver_address = transaction.to_
                amount = int(transaction.amount)
    
                # Get or create receiver
                receiver    = await models.maven_user_cache.get(network='atlasnet', address=receiver_address)
                receiver.mvn_balance = user_ledger[receiver_address]
                await receiver.save()
    
                # Create transfer
                transfer_record = models.MVNTokenTransferHistoryData(
                    timestamp=timestamp,
                    mvn_token=mvn_token,
                    from_=sender,
                    to_=receiver,
                    amount=amount
                )
                await transfer_record.save()
    
                # Check if doorman
                doorman_sender      = await models.Doorman.get_or_none(network='atlasnet', address= sender_address)
                doorman_receiver    = await models.Doorman.get_or_none(network='atlasnet', address= receiver_address)
                if doorman_sender or doorman_receiver:
                    smvn_total_supply   = 0
                    doorman             = None
                    if doorman_sender:
                        smvn_total_supply   = float(transfer.storage.ledger[sender_address])
                        doorman             = doorman_sender
                    else:
                        smvn_total_supply   = float(transfer.storage.ledger[receiver_address])
                        doorman             = doorman_receiver
                    smvn_users          = await models.MavenUser.filter(smvn_balance__gt=0).count()
                    
                    if smvn_users > 0:
                        avg_smvn_per_user       = float(smvn_total_supply) / float(smvn_users)
                        smvn_history_data, _    = await models.SMVNHistoryData.get_or_create(
                            timestamp           = timestamp,
                            doorman             = doorman,
                            level               = level
                        )
                        smvn_history_data.smvn_total_supply     = smvn_total_supply
                        smvn_history_data.mvn_total_supply      = mvn_total_supply
                        smvn_history_data.avg_smvn_per_user     = avg_smvn_per_user
                        await smvn_history_data.save()

    except BaseException as e:
        await save_error_report(e)

