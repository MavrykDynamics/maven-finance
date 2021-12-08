import * as React from 'react'
import { useState } from 'react'
import RichTextEditor, { ToolbarConfig } from 'react-rte'

import { TextEditorContainer } from './TextEditor.style'

export const TextEditor = (props: any) => {
  const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue())

  const _onChange = (value: any) => {
    setEditorState(value)
    if (props.onChange) {
      props.onChange(value.toString('html'))
    }
  }

  const toolbarConfig: ToolbarConfig = {
    // Optionally specify the groups to display (displayed in the order listed).
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'HISTORY_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
      { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
      { label: 'Italic', style: 'ITALIC' },
      { label: 'Underline', style: 'UNDERLINE' },
    ],
    BLOCK_TYPE_BUTTONS: [
      { label: 'UL', style: 'unordered-list-item' },
      { label: 'OL', style: 'ordered-list-item' },
    ],
    BLOCK_TYPE_DROPDOWN: [],
  }

  return (
    <TextEditorContainer>
      <RichTextEditor
        placeholder={'Your description here...'}
        toolbarConfig={toolbarConfig}
        value={editorState}
        onChange={_onChange}
      />
    </TextEditorContainer>
  )
}
