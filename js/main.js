import postApi from './api/postApi'

async function test() {
  const data = await postApi.getAll()
  console.log(data)
}

test()
