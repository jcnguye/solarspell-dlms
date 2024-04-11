import ActionDialog from './action_dialog'
import React from 'react'
import { Button, Container, Typography, Paper, Chip, Grid } from '@material-ui/core'
import { APP_URLS } from '../urls'
import { isNull } from 'lodash'
import prettyBytes from 'pretty-bytes'
import { SerializedMetadataType, SerializedContent, MetadataAPI } from '../types'

type ViewContentProps = {
    metadata_api: MetadataAPI
    on_close: () => void
    is_open: boolean
    row: SerializedContent
}

export const ViewContentModal = ({
    metadata_api,
    on_close,
    is_open,
    row
}: ViewContentProps) => (
    <ActionDialog
        title={"View Content Item"}
        open={is_open}
        get_actions={focus_ref => [(
            <Button
                key={1}
                onClick={on_close}
                color="secondary"
                ref={focus_ref}
            >
                Close
            </Button>
        )]}
    >
        <Grid container>
            <Grid item xs={4}>
                {[
                    ["Title", row.title],
                    ["Display Title", row.display_title],
                    ["Description", row.description],
                    ["Filename", <a href={new URL(row.file_name, APP_URLS.CONTENT_FOLDER).href}>{row.file_name}</a>],
                    ["Year of Publication", row.published_year],
                    ["Reviewed On", row.reviewed_on],
                    ["Copyright Notes", row.copyright_notes],
                    ["Rights Statement", row.rights_statement],
                    ["File Size", isNull(row.filesize) ? 0 : prettyBytes(row.filesize)],
                    ["Additional Notes", row.additional_notes],
                    ["Duplicatable", row.duplicatable ? "Yes" : "No"]
                ].map(([title, value], idx) => {
                    return (
                        <Container style={{marginBottom: "1em"}} key={idx}>
                            <Typography variant={"h6"}>{title}</Typography>
                            <Typography>{(value === null || value === undefined) ? <i>Not Available</i> : value}</Typography>
                        </Container>
                    )
                })}
                {metadata_api.state.metadata_types.map((metadata_type: SerializedMetadataType) => {
                    return (
                        <Container key={metadata_type.id} style={{marginBottom: "1em"}}>
                            <Typography variant={"h6"}>{metadata_type.name}</Typography>
                            <Paper>
                                {
                                    ((metadata) => metadata.length > 0 ?
                                            metadata :
                                            <Typography>No Metadata Entries</Typography>
                                        )(row.metadata_info?.filter(value => value.type_name == metadata_type.name).map((metadata, idx) => (
                                        <li key={idx} style={{listStyle: "none"}}>
                                            <Chip
                                                label={metadata.name}
                                            />
                                        </li>
                                    )))
                                }
                            </Paper>
                        </Container>
                    )
                })}
            </Grid>
            <Grid item xs={8}>
                {is_open ? (
                    <object
                        style={{
                            minHeight: "600px",
                        }}
                        width="600"
                        data={new URL(row.file_name, APP_URLS.CONTENT_FOLDER).href}
                    />
                ) : null}
            </Grid>
        </Grid>
    </ActionDialog>
)
