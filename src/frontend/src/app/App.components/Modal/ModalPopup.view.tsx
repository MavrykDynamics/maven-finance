import { useEffect } from 'react'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'

//styles
import { ModalMask, ModalStyled, ModalCard, ModalClose, ModalCardContent } from 'styles'

type Props = {
  onClose: () => void
  children: React.ReactNode
  width?: number
  className?: string
}

export default function ModalPopup({ onClose, width = 475, children, className }: Props) {
  const handleEsc = (event: KeyboardEvent): void => {
    // close modal press key Esc
    if (event.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleEsc, false)
    return () => document.removeEventListener('keydown', handleEsc, false)
  }, [])

  return (
    <ModalStyled showing={true}>
      <ModalMask showing={true} onClick={onClose} />
      <ModalCard>
        <ModalClose onClick={onClose}>
          <Icon id="error" />
        </ModalClose>
        <ModalCardContent className={className} style={{ width }}>
          {children}
        </ModalCardContent>
      </ModalCard>
    </ModalStyled>
  )
}
