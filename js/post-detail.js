import dayjs from 'dayjs'
import postApi from './api/postApi'
import { registerLightBox, setTextContent } from './utils'

function renderPostDetail(post) {
  if (!post) return
  setTextContent(document, '#postDetailTitle', post.title)
  setTextContent(document, '#postDetailDescription', post.description)
  setTextContent(document, '#postDetailAuthor', post.author)
  setTextContent(
    document,
    '#postDetailTimeSpan',
    dayjs(post.createdAt).format(' - DD/MM/YYYY HH:mm')
  )

  const heroImage = document.getElementById('postHeroImage')
  if (heroImage) {
    heroImage.style.backgroundImage = `url("${post.imageUrl}")`
  }
  if (heroImage) {
    heroImage.src = post.imageUrl
    heroImage.addEventListener('error', () => {
      heroImage.src = 'https://via.placeholder.com/1280x900?text=thumbnail'
    })
  }

  const editPageLink = document.getElementById('goToEditPageLink')
  if (editPageLink) {
    editPageLink.href = `add-edit-post.html?id=${post.id}`
    editPageLink.innerHTML = `<i class="fas fa-edit"></i>Edit Post`
  }
}

;(async () => {
  registerLightBox({
    modalId: 'lightbox',
    imgSelector: 'img[data-id="lightboxImg"]',
    prevSelector: 'button[data-id="lightboxPrev"]',
    nextSelector: 'button[data-id="lightboxNext"]',
  })
  // get post id from URL
  try {
    const queryParams = new URLSearchParams(window.location.search)
    const postId = queryParams.get('id')
    if (!postId) return

    const post = await postApi.getById(postId)
    renderPostDetail(post)
  } catch (error) {
    console.log('failed to post detail')
  }
})()
