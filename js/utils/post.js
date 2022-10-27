import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { setTextContent, truncateText } from './common'

dayjs.extend(relativeTime)

export function createPostElement(post) {
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

  const divElement = liElement.firstElementChild
  divElement.addEventListener('click', (event) => {
    const menu = liElement.querySelector('[data-id="menu"]')
    if (menu && menu.contains(event.target)) return

    window.location.assign(`/post-detail.html?id=${post.id}`)
  })

  const editButton = liElement.querySelector('[data-id="edit"]')
  if (!editButton) return
  editButton.addEventListener('click', (event) => {
    window.location.assign(`/add-edit-post.html?id=${post.id}`)
  })

  const removeButton = liElement.querySelector('[data-id="remove"]')
  if (!removeButton) return
  removeButton.addEventListener('click', () => {
    const customEvent = new CustomEvent('post-delete', {
      bubbles: true,
      detail: post,
    })

    removeButton.dispatchEvent(customEvent)
  })

  return liElement
}

export function renderPostList(elementId, postList) {
  if (!Array.isArray(postList) || postList.length === 0) return

  const ulElement = document.getElementById(elementId)
  if (!ulElement) return

  // clear current list
  ulElement.textContent = ''

  postList.forEach((post) => {
    const liElement = createPostElement(post)
    ulElement.appendChild(liElement)
  })
}
