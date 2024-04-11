import React, { Component } from "react";
import { Grid } from "@material-ui/core";
import { TabDict, TabData } from './types';

interface HomeScreenProps {
    tabs: TabDict,
    change_tab: (tab_name: string) => void
}

export default class HomeScreen extends Component<HomeScreenProps, {}> {
    constructor(props: HomeScreenProps) {
        super(props)
    }

    render() {
        const icon_entries = Object.entries<TabData>(this.props.tabs).map(([tab_name, tab_data]) => {
            const {icon} = tab_data
            if (icon === null) {
                return null
            }
            return (
                <Grid item key={tab_name} xs={3} lg={2} justify="center">
                    <img
                        src={icon}
                        style={{
                            borderRadius: 15,
                            maxHeight: 200,
                            cursor: "pointer"
                        }}
                        onClick={() => this.props.change_tab(tab_name)}
                    />
                </Grid>
            )
        }).filter(value => value !== null)

        return (
            <Grid container justify="center" style={{
                textAlign: "center",
                borderLeft: 32,
                borderRight: 32
            }}>
                {
                    icon_entries
                }
            </Grid>
        )
    }
}