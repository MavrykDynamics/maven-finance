
from mavryk.types.mvk.parameter.transfer import TransferParameter
from dipdup.context import HandlerContext
from mavryk.types.mvk.storage import MvkStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_mvk_transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, MvkStorage],
) -> None:

    # Get transfer batch
    transaction_batch = transfer.parameter.__root__
    timestamp = transfer.data.timestamp
    mvk_address = transfer.data.target_address
    user_ledger = transfer.data.storage['ledger']

    for entry in transaction_batch:
        sender_address = entry.from_
        transactions = entry.txs
        for transaction in transactions:
            receiver_address = transaction.to_
            amount = int(transaction.amount)

            # Get MVK Token
            mvk_token = await models.MVKToken.get(address=mvk_address)

            # Get or create sender
            sender, _ = await models.MavrykUser.get_or_create(
                address=sender_address
            )
            sender.mvk_balance = user_ledger[sender_address]
            await sender.save()

            # Get or create receiver
            receiver, _ = await models.MavrykUser.get_or_create(
                address=receiver_address
            )
            receiver.mvk_balance = user_ledger[receiver_address]
            await receiver.save()

            # Create transfer
            transfer = models.TransferRecord(
                timestamp=timestamp,
                token_address=mvk_token,
                from_=sender,
                to_=receiver,
                amount=amount
            )
            await transfer.save()