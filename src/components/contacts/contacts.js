import React from "react"
import { getContactHref, getIcon } from "../../utils"
import Icon from "../icon/icon"
import "./contacts.scss"

const Contacts = ({ contacts }) => {
  console.log(contacts)

  return (
    <div className={"contacts"}>
      <ul className={"contacts__list"}>
        {Object.keys(contacts).map(name =>
          !contacts[name] ? null : (
            <li className={"contacts__list-item"} key={name}>
              <a
                className={"contacts__list-item-link"}
                href={getContactHref(name, contacts[name])}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name={name} icon={getIcon(name)} />
              </a>
            </li>
          )
        )}
      </ul>
    </div>
  )
}

export default Contacts
