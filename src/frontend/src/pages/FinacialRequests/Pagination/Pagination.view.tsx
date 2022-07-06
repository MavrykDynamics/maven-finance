import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import qs from 'qs'

import { Input } from 'app/App.components/Input/Input.controller'

import { PaginationArrow, PaginationWrapper } from './Pagination.style'

import { ITEMS_PER_PAGE } from '../FinancialRequests.helpers'

const Pagination = ({
  itemsCount,
  side = 'right',
  listName,
}: {
  itemsCount: number
  side?: 'right' | 'left'
  listName: string
}) => {
  const history = useHistory()
  const { pathname, search } = useLocation()
  const { page = {}, ...rest } = qs.parse(search, { ignoreQueryPrefix: true })
  const currentPage = (page as any)?.[listName] || 1

  const [inputValue, setInputValue] = useState(currentPage)

  // TODO: remove if newPage === 1
  const generateNewUrl = (newPage: number) => {
    const newQueryParams = {
      ...rest,
      page: {
        ...(page as Record<string, string>),
        [listName]: newPage,
      },
    }
    return pathname + qs.stringify(newQueryParams, { addQueryPrefix: true })
  }

  // TODO: review it
  useEffect(() => {
    if (inputValue && inputValue >= 1 && inputValue <= pages && (page as any)?.[listName]) {
      history.push(generateNewUrl(inputValue))
    }
  }, [inputValue])

  useEffect(() => {
    setInputValue(currentPage)
  }, [currentPage])

  const pages = itemsCount / ITEMS_PER_PAGE
  return pages > 1 ? (
    <PaginationWrapper side={side}>
      Page
      <div className="input_wrapper">
        <Input
          onChange={(e) => {
            if (e.target.value <= pages) {
              setInputValue(e.target.value)
            }
          }}
          onBlur={() => {}}
          type={'number'}
          value={inputValue}
        />
      </div>
      of {pages}
      <PaginationArrow
        onClick={() => {
          if (currentPage > 1) {
            history.push(generateNewUrl(currentPage - 1))
          }
        }}
      >
        <svg>
          <use xlinkHref="/icons/sprites.svg#paginationArrowLeft" />
        </svg>
      </PaginationArrow>
      <PaginationArrow
        isRight
        onClick={() => {
          if (currentPage < pages) {
            history.push(generateNewUrl(+currentPage + 1))
          }
        }}
      >
        <svg>
          <use xlinkHref="/icons/sprites.svg#paginationArrowLeft" />
        </svg>
      </PaginationArrow>
    </PaginationWrapper>
  ) : null
}

export default Pagination
