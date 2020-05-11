import { useStaticQuery, graphql } from "gatsby"

const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            author {
              name
              bio
              photo
            }
            menu {
              label
              path
            }
            social {
              twitter
              github
              linkedin
              dev
            }
            title
            siteUrl
            description
          }
        }
      }
    `
  )

  return site.siteMetadata
}

export default useSiteMetadata
