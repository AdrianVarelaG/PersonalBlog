import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby";

const About = props => {
  console.log(props)
  const { siteTitle } = props.data

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO />
      <div>
        <h1>About page</h1>
      </div>
    </Layout>
  )
}

export default About

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
