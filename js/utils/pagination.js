export function renderPagination(elementId, pagination) {
  const ulPagination = document.getElementById(elementId)

  if (!pagination || !ulPagination) return
  // calc totalPages
  const { _page, _limit, _totalRows } = pagination
  const totalPages = Math.ceil(_totalRows / _limit)

  // save page and totalPages to ulPagination
  ulPagination.dataset.page = _page
  ulPagination.dataset.totalPages = totalPages

  //check if enable/disable next/prev link
  if (_page <= 1) ulPagination.firstElementChild?.classList.add('disabled')
  else ulPagination.firstElementChild?.classList.remove('disabled')

  if (_page >= totalPages) ulPagination.lastElementChild?.classList.add('disabled')
  else ulPagination.lastElementChild?.classList.remove('disabled')
}

export function initPagination({ elementId, defaultParams, onChange }) {
  const ulPagination = document.getElementById(elementId)
  if (!ulPagination) return

  const prevElement = ulPagination.firstElementChild?.firstElementChild
  if (prevElement) {
    prevElement.addEventListener('click', () => {
      e.preventDefault()

      const page = Number.parseInt(ulPagination.dataset.page) || 1
      if (page > 2) onChange(page - 1)
    })
  }

  const nextElement = ulPagination.lastElementChild?.firstElementChild
  if (nextElement) {
    nextElement.addEventListener('click', () => {
      e.preventDefault()

      const page = Number.parseInt(ulPagination.dataset.page) || 1
      const totalPages = Number.parseInt(ulPagination.dataset.totalPages)
      if (page < totalPages) onChange(page + 1)
    })
  }
}
