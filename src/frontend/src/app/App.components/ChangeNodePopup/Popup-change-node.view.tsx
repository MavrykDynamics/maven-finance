import { Input } from 'app/App.components/Input/Input.controller'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { ACTION_PRIMARY } from '../Button/Button.constants'
import { Button } from '../Button/Button.controller'
import { selectNewRPCNode, setNewRPCNodes } from './ChangeNode.actions'

import {
  ChangeNodeNodesList,
  ChangeNodeNodesListItem,
  DescrText,
  PopupContainerWrapper,
  PopupTitle,
} from './Popup-change-node.style'

export const PopupChangeNodeView = ({ closeModal }: { closeModal: () => void }) => {
  const [inputData, setInputData] = useState('')
  const { RPC_NODES, REACT_APP_RPC_PROVIDER } = useSelector((state: State) => state.preferences)
  const dispatch = useDispatch()
  const [selectedNodeByClick, setSelectedNodeByClick] = useState(REACT_APP_RPC_PROVIDER)

  const addNodeHandler = () => {
    const newRPCNodes = [...RPC_NODES, { title: `user${RPC_NODES.length}`, url: inputData }]
    setInputData('')
    dispatch(setNewRPCNodes(newRPCNodes))
  }

  return (
    <PopupContainerWrapper onClick={(e) => e.stopPropagation()}>
      <div onClick={closeModal} className="close_modal">
        +
      </div>
      <PopupTitle className="change_node">Change RPC Node</PopupTitle>

      <ChangeNodeNodesList className="scroll-block">
        {RPC_NODES.map(({ title, url, nodeLogoUrl }) => (
          <ChangeNodeNodesListItem onClick={() => setSelectedNodeByClick(url)} isSelected={selectedNodeByClick === url}>
            {nodeLogoUrl && (
              <div className="img_wrapper">
                <img src={`./images/${nodeLogoUrl}`} alt={''} />
              </div>
            )}{' '}
            <span className={title.includes('user') ? 'user-url' : ''}>
              {title.includes('user') ? `Link: ${url}` : title}
            </span>
          </ChangeNodeNodesListItem>
        ))}

        <ChangeNodeNodesListItem className="add_node">
          <div className="add-new-node-handler" onClick={() => addNodeHandler()}>
            Add New Node
          </div>
          <Input
            placeholder="https://..."
            name="add_new_node_input"
            value={inputData}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputData(e.target.value)}
            onBlur={() => {}}
          />
        </ChangeNodeNodesListItem>
      </ChangeNodeNodesList>

      <DescrText className="change_node" style={{ marginBottom: '10px' }}>
        Changing node can improve stability and speed when the network is saturated.
      </DescrText>

      <Button
        onClick={() => dispatch(selectNewRPCNode(selectedNodeByClick))}
        className="popup_btn default_svg start_verification"
        text="Confirm"
        icon="okIcon"
        kind={ACTION_PRIMARY}
      />
    </PopupContainerWrapper>
  )
}
