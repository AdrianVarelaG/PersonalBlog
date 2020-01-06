import React from "react"
import Author from "../author/author"
import { useSiteMetaData } from "../../hooks"
import Menu from "../menu/menu"
import Contacts from "../contacts/contacts"

import "./sidebar.scss"

const Sidebar = () => {
  const { author, menu, social } = useSiteMetaData()

  return (
    <div className={"sidebar"}>
      <div className={"sidebar__inner"}>
        <Author author={author} />
        <Menu menu={menu} />
        <Contacts contacts={social} />
      </div>
    </div>
  )
}

export default Sidebar
