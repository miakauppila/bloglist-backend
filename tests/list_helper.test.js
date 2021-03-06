const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const listWithManyBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url:
      'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url:
      'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url:
      'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
]

const listWithZeroBlogs = []

describe('total likes', () => {

  test('only one blog on the list and result is the likes of that one', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })
  test('many blogs on the list and all likes summed up correctly', () => {
    const result = listHelper.totalLikes(listWithManyBlogs)
    expect(result).toBe(36)
  })
  test('of empty list equals zero', () => {
    const result = listHelper.totalLikes(listWithZeroBlogs)
    expect(result).toBe(0)
  })
})

describe('favorite blog', () => {

  const mostLikedOnlyOne = {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    likes: 5
  }

  const mostLikedBlogFromMany = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    likes: 12
  }

  test('only one blog on the list and result is the likes of that one', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    expect(result).toEqual(mostLikedOnlyOne)
  })
  test('most liked blog from a list of many blogs', () => {
    const result = listHelper.favoriteBlog(listWithManyBlogs)
    expect(result).toEqual(mostLikedBlogFromMany)
  })
  test('of empty list returns null', () => {
    const result = listHelper.favoriteBlog(listWithZeroBlogs)
    expect(result).toBe(null)
  })

})

describe('author with the most blogs', () => {
  const mostBlogsOnlyOne = {
    author: 'Edsger W. Dijkstra',
    blogs: 1
  }

  const mostBlogsFromManyCorrectResult = {
    author: 'Robert C. Martin',
    blogs: 3
  }

  test('only one blog on the list and result is the author of that one', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    expect(result).toEqual(mostBlogsOnlyOne)
  })

  test('many blogs on the list and finds the author with most blogs', () => {
    const result = listHelper.mostBlogs(listWithManyBlogs)
    expect(result).toEqual(mostBlogsFromManyCorrectResult)
  })

  test('of empty list returns null', () => {
    const result = listHelper.mostBlogs(listWithZeroBlogs)
    expect(result).toBe(null)
  })

})

describe('author with the most likes in total', () => {
  const mostLikesOnlyOne = {
    author: 'Edsger W. Dijkstra',
    likes: 5
  }

  const mostLikesFromManyCorrectResult = {
    author: 'Edsger W. Dijkstra',
    likes: 17
  }

  test('only one blog on the list and result is the author of that one', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    expect(result).toEqual(mostLikesOnlyOne)
  })

  test('many blogs on the list and finds the author with most summed likes', () => {
    const result = listHelper.mostLikes(listWithManyBlogs)
    expect(result).toEqual(mostLikesFromManyCorrectResult)
  })

  test('of empty list returns null', () => {
    const result = listHelper.mostLikes(listWithZeroBlogs)
    expect(result).toBe(null)
  })

})
