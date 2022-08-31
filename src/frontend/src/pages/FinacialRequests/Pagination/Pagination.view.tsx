import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import qs from 'qs'

import { Input } from 'app/App.components/Input/Input.controller'

import { PaginationArrow, PaginationWrapper } from './Pagination.style'

import { updatePageInUrl } from '../FinancialRequests.helpers'
import { LIST_NAMES_MAPPER, PAGINATION_SIDE_RIGHT } from './pagination.consts'

import { PaginationProps } from '../FinancialRequests.types'

const Pagination = ({ itemsCount, side = PAGINATION_SIDE_RIGHT, listName }: PaginationProps) => {
  const { pathname, search } = useLocation()
  const { page = {}, ...rest } = qs.parse(search, { ignoreQueryPrefix: true })

  const currentPage = (page as any)?.[listName] || 1
  const pagesCount = Math.ceil(itemsCount / LIST_NAMES_MAPPER[listName])

  const [inputValue, setInputValue] = useState(currentPage)
  const history = useHistory()

  const generateNewUrl = (newPage: number) => updatePageInUrl({ page, newPage, listName, pathname, restQP: rest })

  useEffect(() => {
    setInputValue(currentPage)
  }, [currentPage])

  return pagesCount > 1 ? (
    <PaginationWrapper side={side}>
      Page
      <div className="input_wrapper">
        <Input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (+e.target.value <= pagesCount) {
              setInputValue(e.target.value)
            }
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if ((!inputValue && e.key === '0') || e.key === '-') e.preventDefault()
            if (e.key === 'Enter') history.push(generateNewUrl(inputValue))
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
        isDisabled={+currentPage === 1}
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
        isDisabled={+currentPage === +pagesCount}
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
