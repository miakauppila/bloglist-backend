const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => {
    return total + blog.likes
  }, 0)
}

const favoriteBlog = (blogsArray) => {
  if (!blogsArray.length) {
    return null
  }

  //more likes to the beginning of the list
  blogsArray.sort((a, b) => (a.likes > b.likes ? -1 : 1))

  const mostLikedBlog = {
    title: blogsArray[0].title,
    author: blogsArray[0].author,
    likes: blogsArray[0].likes
  }
  return mostLikedBlog
}

const mostBlogs = (blogsArray) => {
  if (!blogsArray.length) {
    return null
  }

  const numberOfBlogsByAuthor = []

  const checkIfAuthorExists = (authorName) => {
    let includes = numberOfBlogsByAuthor.some(e => e.author === authorName)
    if (includes) {
      for (let y = 0; y < numberOfBlogsByAuthor.length; y++) {
        if (numberOfBlogsByAuthor[y].author === authorName) {
          numberOfBlogsByAuthor[y].blogs += 1
        }
      }
    }
    else {
      numberOfBlogsByAuthor.push({ author: authorName, blogs: 1 })
    }
  }

  blogsArray.forEach((blog) => {
    checkIfAuthorExists(blog.author)
    //console.log('index', index, numberOfBlogsByAuthor)
  })

  // more blogs to the beginning of the list, return the top author
  const sortedAuthors = numberOfBlogsByAuthor.sort((a, b) => a.blogs > b.blogs ? -1 : 1)
  return sortedAuthors[0]
}

const mostLikes = (blogsArray) => {
  if (!blogsArray.length) {
    return null
  }

  // convert to Map (reduce to key-value pairs) and reconvert to Array solution found
  // it works!
  const resultArray = Array.from(blogsArray.reduce((m, { author, likes }) =>
    m.set(author, (m.get(author) || 0) + likes), new Map), ([author, likes]) => ({ author, likes }))
  //console.log(resultArray)

  // more likes to the beginning of the list, return the top author
  const sortedResult = resultArray.sort((a, b) => a.likes > b.likes ? -1 : 1)
  return sortedResult[0]
}



module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}