type VerticalPositionTypes = 'start' | 'center' | 'end' | 'nearest'

export const scrollToBottomOfElement = (element: HTMLElement | null, block: VerticalPositionTypes = 'center') => {
  if (!element) return

  element.scrollIntoView({ block, inline: "nearest", behavior: "smooth"})
}
