const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return !blogs
    ? 0
    : blogs.length === 1
    ? blogs[0].likes
    : blogs.reduce(reducer, 0)
}

module.exports = {
  dummy,
  totalLikes,
}
