const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return !blogs || blogs.length === 0
    ? 0
    : blogs.length === 1
    ? blogs[0].likes
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const max = Math.max(...blogs.map((blog) => blog.likes))
  const match = blogs.filter((blog) => blog.likes === max)[0]

  const { _id, url, __v, ...treatedMatch } = match

  return treatedMatch
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
