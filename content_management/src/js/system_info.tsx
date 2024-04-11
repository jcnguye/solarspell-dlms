import { Box, Grid, LinearProgress, Typography } from '@material-ui/core';
import prettyBytes from 'pretty-bytes';
import React from 'react';
import { UtilsAPI } from './types';

type SystemInfoProps = {
    utils_api: UtilsAPI
}

export default class SystemInfo extends React.Component<SystemInfoProps> {
    constructor(props: SystemInfoProps) {
        super(props)
    }

    render() {
        return (
            <Grid container>
                <Grid item xs={1} />
                <Grid item xs={10}>
                    <Typography variant="h4">System Info</Typography>
                    <Box display="flex">
                        <Typography variant="subtitle1">
                            Used: {prettyBytes(this.props.utils_api.state.disk_used)}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={100 * this.props.utils_api.state.disk_used / (this.props.utils_api.state.disk_total + 1)}
                            style={{
                                width: "100%",
                                marginLeft: "10%",
                                marginRight: "10%",
                            }}
                        />
                        <Typography variant="subtitle1">
                            Free: {prettyBytes(this.props.utils_api.state.disk_free)}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        )
    }
}