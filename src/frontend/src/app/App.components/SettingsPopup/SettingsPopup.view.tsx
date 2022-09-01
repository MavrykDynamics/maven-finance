import { Input } from 'app/App.components/Input/Input.controller'
import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { RPCNodeType } from 'reducers/preferences'
import { ACTION_PRIMARY, TRANSPARENT } from '../Button/Button.constants'
import { Button } from '../Button/Button.controller'
import {
  DARK_THEME,
  LIGHT_THEME,
  SPACE_THEME,
  themeSetterAction,
  ThemeType,
} from '../DarkThemeProvider/DarkThemeProvider.actions'
import { selectNewRPCNode, setNewRPCNodes } from './SettingsPopup.actions'

import {
  ChangeNodeNodesList,
  ChangeNodeNodesListItem,
  DescrText,
  PopupContainerWrapper,
  PopupTitle,
} from './SettingsPopup.style'

export const PopupChangeNodeView = ({ closeModal }: { closeModal: () => void }) => {
  const dispatch = useDispatch()
  const { RPC_NODES, REACT_APP_RPC_PROVIDER, themeSelected } = useSelector((state: State) => state.preferences)

  const [inputData, setInputData] = useState('')
  const [selectedNodeByClick, setSelectedNodeByClick] = useState(REACT_APP_RPC_PROVIDER)

  const addNodeHandler = useCallback(() => {
    const newRPCNodes: Array<RPCNodeType> = [...RPC_NODES, { title: inputData, url: inputData, isUser: true }]
    dispatch(setNewRPCNodes(newRPCNodes))
    setInputData('')
  }, [inputData, RPC_NODES])

  const confirmNodeSelecting = useCallback(() => dispatch(selectNewRPCNode(selectedNodeByClick)), [])
  const setNewThemeHandler = useCallback((newTheme: ThemeType) => dispatch(themeSetterAction(newTheme)), [])

  return (
    <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="settings">
      <div className="change-node-block">
        <div onClick={closeModal} className="close_modal">
          +
        </div>
        <PopupTitle className="change_node">Change RPC Node</PopupTitle>

        <ChangeNodeNodesList className="scroll-block">
          {RPC_NODES.map(({ title, url, nodeLogoUrl, isUser }, idx) => (
            <ChangeNodeNodesListItem
              key={title + idx}
              onClick={() => setSelectedNodeByClick(url)}
              isSelected={selectedNodeByClick === url}
            >
              {nodeLogoUrl && (
                <div className="img_wrapper">
                  <img src={`./images/${nodeLogoUrl}`} alt={'node logo'} />
                </div>
              )}{' '}
              <span className={isUser ? 'user-url' : ''}>{isUser ? `Link: ${url}` : title}</span>
            </ChangeNodeNodesListItem>
          ))}
        </ChangeNodeNodesList>

        <ChangeNodeNodesListItem className="add_node">
          <div className="add-new-node-handler" onClick={addNodeHandler}>
            Add New Node
          </div>
          <Input
            placeholder="https://..."
            name="add_new_node_input"
            value={inputData}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputData(e.target.value)}
          />
        </ChangeNodeNodesListItem>

        <DescrText className="change_node" style={{ marginBottom: '10px' }}>
          Changing node can improve stability and speed when the network is saturated.
        </DescrText>

        <Button
          onClick={confirmNodeSelecting}
          className="popup_btn default_svg start_verification"
          text="Confirm"
          icon="okIcon"
          kind={ACTION_PRIMARY}
        />
      </div>

      <div className="theme-switcher-block">
        <PopupTitle className="change_node">Choose The Theme</PopupTitle>

        <div className="buttons-wrapper">
          <Button
            text={'Space'}
            kind={TRANSPARENT}
            onClick={() => setNewThemeHandler(SPACE_THEME)}
            className={`theme-btn ${themeSelected === SPACE_THEME ? 'selected' : ''}`}
          />
          <Button
            text={'Dark'}
            kind={TRANSPARENT}
            onClick={() => setNewThemeHandler(DARK_THEME)}
            className={`theme-btn ${themeSelected === DARK_THEME ? 'selected' : ''}`}
          />
          <Button
            text={'Light'}
            kind={TRANSPARENT}
            onClick={() => setNewThemeHandler(LIGHT_THEME)}
            className={`theme-btn ${themeSelected === LIGHT_THEME ? 'selected' : ''}`}
          />
        </div>
      </div>
    </PopupContainerWrapper>
  )
}
