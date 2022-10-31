import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'

import { CarouselStyle, CarouselViewport, CarouselContainer, CarouselButton } from './Carousel.style'

const compareValues = (element: HTMLDivElement | null) => {
  if (element) {
    return element.scrollWidth > element.offsetWidth
  }

  return false
}

type Props = {
  children: React.ReactNode
  itemLength: number
}

const Carousel = (props: Props) => {
  const { children, itemLength } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const options: Partial<EmblaOptionsType> = { containScroll: 'trimSnaps', dragFree: true }
  // for scroll 3 items
  // const [viewportRef, embla] = useEmblaCarousel({ loop: false, slidesToScroll: 3, skipSnaps: false })
  // for Variable Widths
  const [viewportRef, embla] = useEmblaCarousel(options)
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const showArrows = useMemo(() => compareValues(containerRef.current), [
    containerRef.current?.offsetHeight,
    containerRef.current?.scrollWidth
  ])

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])
  const onSelect = useCallback(() => {
    if (!embla) return
    setPrevBtnEnabled(embla.canScrollPrev())
    setNextBtnEnabled(embla.canScrollNext())
    setSelectedIndex(embla.selectedScrollSnap())
  }, [embla, selectedIndex])

  useEffect(() => {
    if (!embla) return
    embla.on('select', onSelect)
    onSelect()
  }, [embla, onSelect])

  useEffect(() => {
    if (!embla) return
    embla.reInit(options)
  }, [children])

  const arrowIcon = (
    <svg>
      <use xlinkHref="/icons/sprites.svg#arrow-down" />
    </svg>
  )

  return (
    <CarouselStyle>    
      <small className="selected">
        {selectedIndex + 1} from {itemLength}
      </small>
      <CarouselViewport ref={viewportRef}>
        <CarouselContainer ref={containerRef}>{children}</CarouselContainer>
      </CarouselViewport>
      {showArrows ? (
        <>
          <CarouselButton className="button--prev" onClick={scrollPrev} disabled={!prevBtnEnabled}>
            {arrowIcon}
          </CarouselButton>
          <CarouselButton className="button--next" onClick={scrollNext} disabled={!nextBtnEnabled}>
            {arrowIcon}
          </CarouselButton>
        </>
      ) : null}

      <div className='gradient-left'></div>
      <div className='gradient-right'></div>
    </CarouselStyle>
  )
}

export default Carousel
