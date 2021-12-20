import { ContentState, convertFromHTML } from 'draft-js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import RichTextEditor, { ToolbarConfig } from 'react-rte'

import { TextEditorContainer } from './TextEditor.style'

type TextEditorProps = {
  onChange: (value: any) => void
  initialValue?: string
}
export const TextEditor = ({ onChange, initialValue }: TextEditorProps) => {
  const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue())

  // useEffect(() => {
  //   if (initialValue && initialValue.length > 0) {
  //     setEditorState(RichTextEditor.createValueFromString(initialValue, 'html'))
  //   }
  // }, [initialValue])
  const _onChange = (value: any) => {
    setEditorState(value)
    console.log(value.toString('html'))
    if (onChange) {
      onChange(value.toString('html'))
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
