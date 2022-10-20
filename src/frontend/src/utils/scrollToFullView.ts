type VerticalPositionTypes = 'start' | 'center' | 'end' | 'nearest'

export const scrollToFullView = (element: HTMLElement | null, block: VerticalPositionTypes = 'center') => {
  if (!element) return
  var position = element.getBoundingClientRect();

  if (
    position.top >= 0 &&
    position.left >= 0 &&
    position.right <= (window.innerWidth || document.documentElement.clientWidth) &&
    position.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  ) {
    // In the viewport
    return
  } 

  // Not in the viewport
  element.scrollIntoView({ block, inline: "nearest", behavior: "smooth"})
}
