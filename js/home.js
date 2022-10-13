import dayjs from 'dayjs'
import postApi from './api/postApi'
import { getUlPagination, setTextContent, truncateText } from './utils'
import relativeTime from 'dayjs/plugin/relativeTime'
import debounce from 'lodash.debounce'

dayjs.extend(relativeTime)

function createPostElement(post) {
  if (!post) return

  const postTemplate = document.getElementById('postTemplate')
  if (!postTemplate) return

  const liElement = postTemplate.content.firstElementChild.cloneNode(true)
  if (!liElement) return
  setTextContent(liElement, '[data-id="title"]', post.title)
  setTextContent(liElement, '[data-id="description"]', truncateText(post.description, 100))
  setTextContent(liElement, '[data-id="author"]', post.author)

  const time = dayjs(post.updatedAt).fromNow()
  setTextContent(liElement, '[data-id="timeSpan"]', `- ${time}`)

  const thumbnailElement = liElement.querySelector('[data-id="thumbnail"]')
  if (thumbnailElement) {
    thumbnailElement.src = post.imageUrl
    thumbnailElement.addEventListener('error', () => {
      thumbnailElement.src = 'https://via.placeholder.com/1280x900?text=thumbnail'
    })
  }

  return liElement
}

function renderPostList(postList) {
  if (!Array.isArray(postList) || postList.length === 0) return

  const ulElement = document.getElementById('postsList')
  if (!ulElement) return

  // clear current list
  ulElement.textContent = ''

  postList.forEach((post) => {
    const liElement = createPostElement(post)
    ulElement.appendChild(liElement)
  })
}

function renderPagination(pagination) {
  const ulPagination = getUlPagination()

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

async function handleFilterChange(filterName, filterValue) {
  // update query params
  try {
    const url = new URL(window.location)
    url.searchParams.set(filterName, filterValue)

    if (filterName === 'title_like') url.searchParams.set('_page', 1)

    history.pushState({}, '', url)

    const { data, pagination } = await postApi.getAll(url.searchParams)

    renderPostList(data)
    renderPagination(pagination)
  } catch (error) {
    console.log('failed to fetch post list', error)
  }
}

function handlePrev(e) {
  e.preventDefault()

  const ulPagination = getUlPagination()
  if (!ulPagination) return

  const page = Number.parseInt(ulPagination.dataset.page) || 1
  if (page <= 1) return

  handleFilterChange('_page', page - 1)
}

function handleNext(e) {
  e.preventDefault()

  const ulPagination = getUlPagination()
  if (!ulPagination) return

  const page = Number.parseInt(ulPagination.dataset.page) || 1
  const totalPages = Number.parseInt(ulPagination.dataset.totalPages)
  if (page >= totalPages) return

  handleFilterChange('_page', page + 1)
}

function initSearch() {
  const searchInput = document.getElementById('searchInput')
  if (!searchInput) return

  //set default values from query params
  const queryParams = new URLSearchParams(window.location.search)
  if (queryParams.get('title_like')) {
    searchInput.value = queryParams.get('title_like')
  }

  const debounceSearch = debounce(
    (event) => handleFilterChange('title_like', event.target.value),
    500
  )
  searchInput.addEventListener('input', debounceSearch)
}

function initPagination() {
  const ulPagination = getUlPagination()
  if (!ulPagination) return

  const prevElement = ulPagination.firstElementChild?.firstElementChild
  if (prevElement) {
    prevElement.addEventListener('click', handlePrev)
  }

  const nextElement = ulPagination.lastElementChild?.firstElementChild
  if (nextElement) {
    nextElement.addEventListener('click', handleNext)
  }
}

function initURL() {
  const url = new URL(window.location)

  //update search if needed
  if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1)
  if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 6)

  history.pushState({}, '', url)
}

;(async () => {
  try {
    initURL()
    initPagination()
    initSearch()

    const queryParams = new URLSearchParams(window.location.search)

    const { data, pagination } = await postApi.getAll(queryParams)

    renderPostList(data)
    renderPagination(pagination)
  } catch (error) {
    console.log('get all failed', error)
  }
})()
