import React from "react"
import "./icon.scss"

const Icon = ({ name, icon }) => (
  <svg className={"icon"} viewBox={icon.viewBox}>
    <title>{name}</title>
    <path d={icon.path} />
  </svg>
)

export default Icon
