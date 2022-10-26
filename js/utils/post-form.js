import { randomNumber, setBackgroundImage, setFieldValue, setTextContent } from './common'
import * as yup from 'yup'

function getFormValues(form) {
  const formValues = {}
  //1: query each input and add to formValues object
  //   ;['title', 'author', 'description', 'imageUrl'].forEach((name) => {
  //     const field = form.querySelector(`[name="${name}"]`)
  //     if (field) formValues[name] = field.value
  //   })

  //2 using formdata
  const data = new FormData(form)
  for (const [key, value] of data) {
    formValues[key] = value
  }

  return formValues
}

function setFormValues(form, formValues) {
  setFieldValue(form, '[name="title"]', formValues?.title)
  setFieldValue(form, '[name="author"]', formValues?.author)
  setFieldValue(form, '[name="description"]', formValues?.description)
  setFieldValue(form, '[name="imageUrl"]', formValues?.imageUrl)

  setBackgroundImage(document, '#postHeroImage', formValues?.imageUrl)
}

function getPostSchema() {
  return yup.object().shape({
    title: yup.string().required('Please enter title'),
    author: yup
      .string()
      .required('Please enter author')
      .test(
        'at-least-two-words',
        'Please enter at least two words',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 3).length >= 2
      ),
    description: yup.string(),
    imageUrl: yup
      .string()
      .required('Please random a background image')
      .url('Please enter a valid URL'),
  })
}

function setFieldError(form, name, error) {
  const element = form.querySelector(`[name="${name}"]`)
  if (element) {
    element.setCustomValidity(error)
    setTextContent(element.parentElement, '.invalid-feedback', error)
  }
}

async function validatePostForm(form, formValues) {
  try {
    ;['title', 'author', 'imageUrl'].forEach((name) => setFieldError(form, name, ''))

    const schema = getPostSchema()
    await schema.validate(formValues, { abortEarly: false })
  } catch (error) {
    // console.log(error.name)
    // console.log(error.inner)

    const errorLog = {}

    if (error.name === 'ValidationError' && Array.isArray(error.inner)) {
      for (const validationError of error.inner) {
        const name = validationError.path
        if (errorLog[name]) continue

        setFieldError(form, name, validationError.message)
        errorLog[name] = true
      }
    }
  }

  // add was-validated class to form element
  const isValid = form.checkValidity()
  if (!isValid) form.classList.add('was-validated')
  return isValid
}

function initRandomImage(form) {
  const randomButton = document.getElementById('postChangeImage')
  if (!randomButton) return

  randomButton.addEventListener('click', () => {
    // random ID
    // build URL
    // set imageUrl input + background
    const imageUrl = `https://picsum.photos/id/${randomNumber(1000)}/1368/400`

    setFieldValue(form, '[name="imageUrl"]', imageUrl)
    setBackgroundImage(document, '#postHeroImage', imageUrl)
  })
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId)
  if (!form) return

  let submitting = false
  setFormValues(form, defaultValues)

  // init image events
  initRandomImage(form)
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (submitting) return
    submitting = true

    const formValues = getFormValues(form)
    formValues.id = defaultValues.id

    // validation
    const isValid = await validatePostForm(form, formValues)
    if (isValid) await onSubmit?.(formValues)

    submitting = false
  })
}
