import React, { Component } from "react"
import { MoreVert } from '@material-ui/icons'
import { Menu, MenuItem } from '@material-ui/core'
import { update_state } from '../utils'

//items: Array of tuples containing a menu action function and then a string to represent that action in the menu
interface KebabMenuProps {
    items: [() => void, string][] 
}
interface KebabMenuState {
    anchor_el: null | SVGSVGElement
}

export default class KebabMenu extends Component<KebabMenuProps, KebabMenuState> {

    update_state: (update_func: (draft: KebabMenuState) => void) => Promise<void>
    constructor(props: Readonly<KebabMenuProps>) {
        super(props)

        this.state = {
            anchor_el: null
        }

        this.on_close = this.on_close.bind(this)
        this.update_state = update_state.bind(this)
    }

    on_close() {
        return this.update_state(draft => {
            draft.anchor_el = null
        })
    }

    render() {
        return (
            <>
                <MoreVert
                    onClick={evt => {
                        evt.stopPropagation()
                        evt.preventDefault()
                        this.setState({
                            anchor_el: evt.currentTarget
                        })
                    }}
                />
                <Menu
                    anchorEl={this.state.anchor_el}
                    open={Boolean(this.state.anchor_el)}
                    keepMounted
                    onClose={evt => {
                        //evt is actually a click evt, this is a bug with MUI
                        (evt as MouseEvent).stopPropagation()
                        this.on_close()
                    }}
                >
                    {this.props.items.map((item, idx) => {
                        const [func, element] = item
                        return (
                            <MenuItem
                                onClick={evt => {
                                    evt.stopPropagation()
                                    evt.preventDefault()
                                    this.on_close().then(func)
                                }}
                                key={idx}
                            >
                                {element}
                            </MenuItem>
                        )
                    })}
                </Menu>
            </>
        )
    }
}