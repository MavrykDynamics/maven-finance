import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// const
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'

// view
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DropDown } from '../../../app/App.components/DropDown/DropDown.controller'

// action
import { dropFinancialRequest } from '../Council.actions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormDropFinancialRequest = () => {
  const dispatch = useDispatch()
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { financialRequestLedger } = governanceStorage

  const itemsForDropDown = useMemo(
    () =>
      financialRequestLedger?.length
        ? [
            { text: 'Choose Financial Request', value: '' },
            ...financialRequestLedger.map((item: any, i: number) => {
              return {
                text: `${i + 1}-${item.request_purpose}`,
                value: item.id,
              }
            }),
          ]
        : [{ text: 'Choose Financial Request', value: '' }],
    [financialRequestLedger],
  )

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  const [form, setForm] = useState({
    financialReqID: '',
  })

  const { financialReqID } = form

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      if (!financialReqID) {
        dispatch(showToaster(ERROR, 'Please enter valid function parameter', 'Choose Financial Request to drop'))
        return
      }

      await dispatch(dropFinancialRequest(+financialReqID))
      setForm({
        financialReqID: '',
      })

      setChosenDdItem(itemsForDropDown[0])
    } catch (error) {
      console.error(error)
    }
  }

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {
    setForm((prev) => {
      return { ...prev, financialReqID: item.value }
    })
  }

  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Drop Financial Request</h1>
      <p>Please enter valid function parameters for dropping a financial request</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Choose Financial Request to drop</label>
          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder={ddItems[0]}
            isOpen={ddIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            clickOnItem={(e) => handleOnClickDropdownItem(e)}
          />
        </div>
        <div className="button-aligment">
          <Button
            text="Drop Financial Request"
            className="plus-btn fill"
            kind={'actionPrimary'}
            icon="close-stroke"
            type="submit"
          />
        </div>
      </div>
    </CouncilFormStyled>
  )
}
