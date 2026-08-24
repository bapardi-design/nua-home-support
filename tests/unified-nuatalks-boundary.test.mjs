import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

test('published support metadata presents Circles, posts, messages and calls as NuaTalks', async () => {
  const [support, talksSupport, talksPrivacy, vercel] = await Promise.all([
    readFile(new URL('dist/support.html', root), 'utf8'),
    readFile(new URL('dist/talk/support.html', root), 'utf8'),
    readFile(new URL('dist/talk/privacy.html', root), 'utf8'),
    readFile(new URL('vercel.json', root), 'utf8').then(JSON.parse),
  ])
  const published = `${support}\n${talksSupport}\n${talksPrivacy}`

  assert.match(support, /NuaTalks chats, calls and private Circles/)
  assert.match(talksSupport, /NuaTalks/)
  assert.match(talksPrivacy, /NuaTalks/)
  assert.match(talksSupport, /https:\/\/nua-talks\.com\/delete-account/)
  assert.match(talksPrivacy, /https:\/\/nua-talks\.com\/delete-account/)
  assert.doesNotMatch(published, /NuaConnects?|VestaTalks?|Vesta Connects?/i)
  assert.doesNotMatch(published, /NuaTalks and calling remain unavailable/i)
  assert.deepEqual(vercel.redirects, [
    { source: '/connect/:path*', destination: '/talk/:path*', permanent: true },
  ])
})

test('retired Connect logos are not included in the published asset bundle', async () => {
  const files = await readdir(new URL('dist/assets/brand/', root))
  assert.equal(files.some((file) => /nuaconnect/i.test(file)), false)
  assert.equal(files.includes('nuatalks-mark.svg'), true)
  assert.equal(files.includes('nuatalks-wordmark.svg'), true)
})
