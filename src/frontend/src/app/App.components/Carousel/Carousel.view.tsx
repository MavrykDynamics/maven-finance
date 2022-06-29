import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { CarouselStyle, CarouselViewport, CarouselContainer, CarouselButton } from './Carousel.style'

type Props = {
  children: React.ReactNode
}

const Carousel = (props: Props) => {
  const { children } = props
  const [viewportRef, embla] = useEmblaCarousel({ loop: false, slidesToScroll: 3, skipSnaps: false })
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])
  const onSelect = useCallback(() => {
    if (!embla) return
    setPrevBtnEnabled(embla.canScrollPrev())
    setNextBtnEnabled(embla.canScrollNext())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    embla.on('select', onSelect)
    onSelect()
  }, [embla, onSelect])

  const arrowIcon = (
    <svg>
      <use xlinkHref="/icons/sprites.svg#arrow-down" />
    </svg>
  )
  return (
    <CarouselStyle>
      <CarouselViewport ref={viewportRef}>
        <CarouselContainer>{children}</CarouselContainer>
      </CarouselViewport>
      <CarouselButton className="button--prev" onClick={scrollPrev} disabled={!prevBtnEnabled}>
        {arrowIcon}
      </CarouselButton>
      <CarouselButton className="button--next" onClick={scrollNext} disabled={!nextBtnEnabled}>
        {arrowIcon}
      </CarouselButton>
    </CarouselStyle>
  )
}

export default Carousel
