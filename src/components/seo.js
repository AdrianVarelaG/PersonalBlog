/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { withPrefix } from "gatsby"
import { useSiteMetaData } from "../hooks"

const SEO = ({ description, lang, meta, title }) => {
  const siteMetadata = useSiteMetaData()
  const metaDescription = description || siteMetadata.description
  const metaImage = siteMetadata.author.photo

  const metaImageUrl = siteMetadata.siteUrl + withPrefix(metaImage)

  return (
    <Helmet>
      <html lang="en" />
      <title>{siteMetadata.title}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:site_name" content={siteMetadata.title} />
      <meta property="og:image" content={metaImageUrl} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={siteMetadata.title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImageUrl} />
    </Helmet>
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
}

export default SEO
