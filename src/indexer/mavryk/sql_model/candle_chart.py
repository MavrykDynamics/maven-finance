from datetime import datetime
from datetime import timezone
from decimal import Decimal
from dipdup.models import Model, fields
from pydantic.dataclasses import dataclass
from typing import List, Union
from datetime import datetime, timedelta
from mavryk.sql_model.enums import CandleInterval
###
# Candle Chart Tables
###


class CandleChart(Model):
    id                                      = fields.BigIntField(pk=True)
    exchange_id                             = fields.CharField(max_length=36, default="", index=True)
    type                                    = fields.IntEnumField(enum_type=CandleInterval, index=True)

    @classmethod
    def calc_current_bucket(cls, timestamp, round_to):
        dt = datetime.now() if timestamp is None else timestamp
        seconds = (dt.replace(tzinfo=None) - dt.min).seconds
        rounding = seconds // round_to * round_to
        return dt + timedelta(0, rounding-seconds, -dt.microsecond)

    class Meta:
        table = 'candle_chart'


class CandleData(Model):
    id                                      = fields.BigIntField(pk=True)
    chart                                   = fields.ForeignKeyField('models.CandleChart', related_name='data', index=True)
    bucket                                  = fields.DatetimeField(index=True)
    average                                 = fields.FloatField(default=0.0)
    low                                     = fields.FloatField(default=0.0)
    high                                    = fields.FloatField(default=0.0)
    open                                    = fields.FloatField(default=0.0)
    close                                   = fields.FloatField(default=0.0)
    token_volume                            = fields.FloatField(default=0.0)
    xtz_volume                              = fields.FloatField(default=0.0)
    trades                                  = fields.BigIntField(default=0)

    class Meta:
        table = 'candle_data'
