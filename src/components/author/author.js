import React, { Fragment } from "react"
import { withPrefix } from "gatsby"

import "./author.scss"

const Author = ({ author }) => {
  return (
    <Fragment>
      <img
        src={withPrefix(author.photo)}
        className={"author__photo"}
        width="75"
        height="75"
        alt={author.name}
      />
      <h1 className={"author__title"}>{author.name}</h1>
      <p className={"author__subtitle"}>{author.bio}</p>
    </Fragment>
  )
}

export default Author
