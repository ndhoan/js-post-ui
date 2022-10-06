import dayjs from 'dayjs'
import postApi from './api/postApi'
import { setTextContent, truncateText } from './utils'
import relativeTime from 'dayjs/plugin/relativeTime'

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

  postList.forEach((post) => {
    const liElement = createPostElement(post)
    ulElement.appendChild(liElement)
  })
}

function handlePrev(e) {
  e.preventDefault()
  console.log('prev')
}

function handleNext(e) {
  e.preventDefault()
  console.log('next')
}

function initPagination() {
  const ulPagination = document.getElementById('pagination')
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
    initPagination()
    initURL()

    const queryParams = new URLSearchParams(window.location.search)

    // const queryParams = {
    //   _page: 1,
    //   _limit: 6,
    // }
    const { data, pagination } = await postApi.getAll(queryParams)
    renderPostList(data)
  } catch (error) {
    console.log('get all failed', error)
  }
})()
