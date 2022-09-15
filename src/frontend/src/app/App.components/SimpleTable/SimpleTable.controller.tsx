import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { TzAddress } from '../TzAddress/TzAddress.view'
import { SimpletableStyled } from './SimpleTable.style'

type TableProps = {
  className?: string
  colunmNames: Array<string>
  data: Array<Record<string, string | number | null>>
  fieldsMapper: Array<{
    fieldName: string
    needCommaNumber?: boolean
    needTzAddress?: boolean
    propsToComponents?: Record<string, unknown>
    callback?: (fieldName: string, arg: unknown) => JSX.Element
  }>
}

export const SimpleTable = ({ colunmNames, data, fieldsMapper, className = '' }: TableProps) => {
  return (
    <SimpletableStyled className={`simple-table ${className}`}>
      <div className="row column-names">
        {colunmNames.map((name) => (
          <div className="row-item">{name}</div>
        ))}
      </div>

      <div className="table-content scroll-block">
        {data.map((item) => {
          return (
            <div className="row" key={item.id}>
              {fieldsMapper.map(({ fieldName, needCommaNumber, needTzAddress, callback, propsToComponents = {} }) => {
                if (item?.[fieldName] === undefined) return null

                if (callback) {
                  return (
                    <div className="row-item" key={item[fieldName] + fieldName}>
                      {callback(fieldName, item)}
                    </div>
                  )
                }

                if (needCommaNumber) {
                  return (
                    <div className="row-item" key={item[fieldName] + fieldName}>
                      <CommaNumber {...propsToComponents} value={Number(item[fieldName])} />
                    </div>
                  )
                }

                if (needTzAddress) {
                  return (
                    <div className="row-item" key={item[fieldName] + fieldName}>
                      <TzAddress hasIcon {...propsToComponents} tzAddress={String(item[fieldName])} />
                    </div>
                  )
                }

                return (
                  <div className="row-item" key={item[fieldName] + fieldName}>
                    {item[fieldName]}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </SimpletableStyled>
  )
}
