import mavryk.models as models
import sys
import traceback
import os
import telegram

###
#
# ERROR REPORTING IN DATABASE
#
###
async def save_error_report(exception):

    # Get current system exception
    ex_type, ex_value, ex_traceback = sys.exc_info()

    # Extract unformatter stack traces as tuples
    trace_back = traceback.extract_tb(ex_traceback)

    # Format stacktrace
    stack_trace = ""

    for trace in trace_back:
        stack_trace += f"\n        Func.Name : {trace[2]}\n        Line : {trace[1]}\n        Message : {trace[3]}\n"

    dipdup_exception    = models.DipdupException(
        type    = ex_type.__name__,
        value   = ex_value,
        trace   = stack_trace
    )
    await dipdup_exception.save()

    # Send a message to telegram
    telegram_enable_reporting   = os.getenv("TELEGRAM_ENABLE_REPORTING")
    if str(telegram_enable_reporting).upper() == "TRUE":
        telegram_bot_token          = os.getenv("TELEGRAM_BOT_API_TOKEN")
        telegram_channel            = os.getenv("TELEGRAM_CHANNEL_ID")

        bot                         = telegram.Bot(token=telegram_bot_token)

        error_message               = f"⚠️ Indexer Error Found\n\n - Type: {dipdup_exception.type}\n - Value: {dipdup_exception.value}\n - Trace: {dipdup_exception.trace}"

        await bot.send_message(chat_id=telegram_channel, text=error_message)

    # End or throw depending on debug mode
    debug_mode_enabled          = os.getenv("DEBUG_MODE")
    if debug_mode_enabled == "True" or debug_mode_enabled == "true":
        raise exception
    else:
        return
