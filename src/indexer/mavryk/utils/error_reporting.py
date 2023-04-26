import mavryk.models as models
import sys
import traceback

###
#
# ERROR REPORTING IN DATABASE
#
###
async def save_error_report():
    # Get current system exception
    ex_type, ex_value, ex_traceback = sys.exc_info()

    # Extract unformatter stack traces as tuples
    trace_back = traceback.extract_tb(ex_traceback)

    # Format stacktrace
    stack_trace = list()

    for trace in trace_back:
        stack_trace.append("File : %s , Line : %d, Func.Name : %s, Message : %s" % (trace[0], trace[1], trace[2], trace[3]))

    dipdup_exception    = models.DipdupException(
        type    = ex_type.__name__,
        value   = ex_value,
        trace   = str(stack_trace)
    )
    await dipdup_exception.save()
    return
