const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => {
    return total + blog.likes
  }, 0)
}

const favoriteBlog = (blogs) => {

  if (!blogs.length) {
    return null
  }

  //more likes to the beginning of the list
  blogs.sort((a, b) => (a.likes > b.likes ? -1 : 1))

  const mostLikedBlog = {
    title: blogs[0].title,
    author: blogs[0].author,
    likes: blogs[0].likes
  }
  return mostLikedBlog
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}