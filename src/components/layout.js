import React from "react"
//import { rhythm, scale } from "../utils/typography"
import Sidebar from "./sidebar/sidebar"
import styles from "./layout.module.scss"
import Page from "./page/page"

const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Page>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </Page>
    </div>
  )
}

export default Layout
