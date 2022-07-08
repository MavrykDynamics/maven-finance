import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import qs from 'qs'

import { Input } from 'app/App.components/Input/Input.controller'

import { PaginationArrow, PaginationWrapper } from './Pagination.style'

import { PAGINATION_SIDE_RIGHT, ITEMS_PER_PAGE } from '../FinancialRequests.consts'
import { updatePageInUrl } from '../FinancialRequests.helpers'

import { PaginationProps } from '../FinancialRequests.types'

const Pagination = ({ itemsCount, side = PAGINATION_SIDE_RIGHT, listName }: PaginationProps) => {
  const { pathname, search } = useLocation()
  const { page = {}, ...rest } = qs.parse(search, { ignoreQueryPrefix: true })

  const currentPage = (page as any)?.[listName] || 1
  const pagesCount = itemsCount / ITEMS_PER_PAGE

  const [inputValue, setInputValue] = useState(currentPage)
  const history = useHistory()

  const generateNewUrl = (newPage: number) => updatePageInUrl({ page, newPage, listName, pathname, restQP: rest })

  useEffect(() => {
    if (inputValue) {
      history.push(generateNewUrl(inputValue))
    }
  }, [inputValue])

  useEffect(() => {
    setInputValue(currentPage)
  }, [currentPage])

  return pagesCount > 1 ? (
    <PaginationWrapper side={side}>
      Page
      <div className="input_wrapper">
        <Input
          onChange={(e) => {
            if (e.target.value <= pagesCount) {
              setInputValue(e.target.value)
            }
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if ((!inputValue && e.key === '0') || e.key === '-') e.preventDefault()
          }}
          onBlur={() => {
            if (!inputValue && !inputValue !== currentPage) setInputValue(currentPage)
          }}
          type={'number'}
          value={inputValue}
        />
      </div>
      of {pagesCount}
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
          if (currentPage < pagesCount) {
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
