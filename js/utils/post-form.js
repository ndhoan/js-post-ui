import { randomNumber, setBackgroundImage, setFieldValue, setTextContent } from './common'
import * as yup from 'yup'

const ImageSource = {
  PICSUM: 'picsum',
  UPLOAD: 'upload',
}

function getFormValues(form) {
  const formValues = {}
  //1: query each input and add to formValues object
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
    imageSource: yup
      .string()
      .required('Please select an image source')
      .oneOf([ImageSource.PICSUM, ImageSource.UPLOAD], 'Invalid image source'),
    imageUrl: yup.string().when('imageSource', {
      is: ImageSource.PICSUM,
      then: yup.string().required('Please random a background image').url('Please enter valid URL'),
    }),
    image: yup.mixed().when('imageSource', {
      is: ImageSource.UPLOAD,
      then: yup
        .mixed()
        .test('required', 'Please select an image to upload', (file) => Boolean(file?.name))
        .test('max-3b', 'Max 3mb', (file) => {
          const fileSize = file?.size
          const MAX_SIZE = 3 * 1024 * 1024
          return fileSize <= MAX_SIZE
        }),
    }),
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
    ;['title', 'author', 'imageUrl', 'image'].forEach((name) => setFieldError(form, name, ''))

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

async function validateFormField(form, formValues, name) {
  try {
    // clear error
    setFieldError(form, name, '')

    const schema = getPostSchema()
    await schema.validateAt(name, formValues)
  } catch (error) {
    setFieldError(form, name, error.message)
  }

  const field = form.querySelector(`[name=${name}]`)
  if (field && !field.checkValidity()) {
    field.parentElement.classList.add('was-validated')
  }
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

function renderImageSourceControl(form, selectedValue) {
  const controlList = form.querySelectorAll('[data-id="imageSource"]')
  controlList.forEach((control) => {
    control.hidden = control.dataset.imageSource !== selectedValue
  })
}

function initRadioImageSource(form) {
  const radioList = form.querySelectorAll('[name="imageSource"]')
  radioList.forEach((radio) => {
    radio.addEventListener('change', (event) => renderImageSourceControl(form, event.target.value))
  })
}

function initUploadImage(form) {
  const uploadImage = form.querySelector('[name="image"]')
  if (!uploadImage) return

  uploadImage.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (file) {
      const imageURL = URL.createObjectURL(file)
      setBackgroundImage(document, '#postHeroImage', imageURL)

      // trigger validation of upload image
      validateFormField(form, { imageSource: ImageSource.UPLOAD, image: file }, 'image')
    }
  })
}

function initValidationOnChange(form) {
  ;['title', 'author'].forEach((name) => {
    const field = form.querySelector(`[name=${name}]`)
    if (field) {
      field.addEventListener('input', (event) => {
        const newValue = event.target.value
        validateFormField(form, { [name]: newValue }, name)
      })
    }
  })
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId)
  if (!form) return

  let submitting = false
  setFormValues(form, defaultValues)

  // init image events
  initRandomImage(form)
  initRadioImageSource(form)
  initUploadImage(form)
  initValidationOnChange(form)

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
