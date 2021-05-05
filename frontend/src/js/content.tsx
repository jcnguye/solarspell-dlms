import React, { Component } from 'react';


import { APP_URLS } from './urls';
import { cloneDeep } from 'lodash';
import ActionDialog from './reusable/action_dialog';
import {Box, Button, Checkbox, Typography} from '@material-ui/core';
import Axios from 'axios';
import VALIDATORS from './validators';
import { update_state } from './utils';
import ContentModal from './reusable/content_modal';

import { MetadataAPI, SerializedContent, ContentsAPI } from './types';
import { ViewContentModal } from './reusable/view_content_modal';
import ContentSearch from './reusable/content_search';
import BulkContentModal from "./reusable/bulk_content_modal";


interface ContentProps {
    metadata_api: MetadataAPI
    contents_api: ContentsAPI
    show_toast_message: (message: string, is_success: boolean) => void
    close_toast: () => void
    show_loader: () => void
    remove_loader: () => void
}

interface ContentState {
    modals: ContentModals
}

interface ContentModals {
    add: {
        is_open: boolean
    }
    view: {
        is_open: boolean
        row: SerializedContent
    }
    edit: {
        is_open: boolean
        row: SerializedContent
    }
    delete_content: {
        is_open: boolean
    }
    bulk_add: {
        is_open: boolean
    }
    column_select: {
        is_open: boolean
    }
    bulk_download: {
        is_open: boolean
    }
}

export default class Content extends Component<ContentProps, ContentState> {

    update_state: (update_func: (draft: ContentState) => void) => Promise<void>

    modal_defaults: ContentModals
    content_defaults: SerializedContent

    constructor(props: ContentProps) {
        super(props)

        this.update_state = update_state.bind(this)

        this.content_defaults = {
            id: 0,
            file_name: "",
            filesize: 0,
            content_file: "",
            title: "",
            description: null,
            modified_on: "",
            reviewed_on: "",
            copyright_notes: null,
            rights_statement: null,
            additional_notes: "",
            active: false,
            metadata: [],
            metadata_info: [],
            published_year: "",
            duplicatable: false
        }

        this.modal_defaults = {
            add: {
                is_open: false
            },
            view: {
                is_open: false,
                row: this.content_defaults
            },
            edit: {
                is_open: false,
                row: this.content_defaults
            },
            delete_content: {
                is_open: false,
            },
            bulk_add: {
                is_open: false,
            },
            column_select: {
                is_open: false,
            },
            bulk_download: {
                is_open: false,
            }
        }

        this.state = {
            modals: cloneDeep(this.modal_defaults)
        }

        this.close_modals = this.close_modals.bind(this)
        this.update_state = this.update_state.bind(this)
    }

    //Resets the state of a given modal. Use this to close the modal.
    close_modals() {
        this.update_state(draft => {
            draft.modals = cloneDeep(this.modal_defaults)
        })
    }

    render() {
        const {
            add,
            view,
            edit,
            bulk_add
        } = this.state.modals
        const {
            metadata_api,
            contents_api
        } = this.props
        return (
            <React.Fragment>
                <Button
                    onClick={_ => {
                        this.update_state(draft => {
                            draft.modals.add.is_open = true
                        })
                    }}
                    style={{
                        marginLeft: "1em",
                        marginBottom: "1em",
                        backgroundColor: "#75b2dd",
                        color: "#FFFFFF"
                    }}
                >New Content
                </Button>
                <Button
                    onClick={_ => this.update_state(draft => {
                        draft.modals.delete_content.is_open = true
                    })}
                    style={{
                        marginLeft: "1em",
                        marginBottom: "1em",
                        backgroundColor: "#75b2dd",
                        color: "#FFFFFF"
                    }}
                >Delete Selected
                </Button>
                <Button
                    onClick={_ => {
                        this.update_state(draft => {
                            draft.modals.bulk_add.is_open = true
                        })
                    }}
                    style={{
                        marginLeft: "1em",
                        marginBottom: "1em",
                        backgroundColor: "#75b2dd",
                        color: "#FFFFFF"
                    }}
                >Add Bulk Content
                </Button>
                <Button
                    onClick={_ => this.props.contents_api.bulk_download()}
                    style={{
                        marginLeft: "1em",
                        marginBottom: "1em",
                        backgroundColor: "#75b2dd",
                        color: "#FFFFFF"
                    }}
                >
                    Bulk Download
                </Button>
                <Button
                    onClick={_ => {
                        this.update_state(draft => {
                            draft.modals.column_select.is_open = true
                        })
                    }}
                    style={{
                        marginLeft: "1em",
                        marginBottom: "1em",
                        float: "right",
                        marginRight: "1em",
                        //backgroundColor: "#75b2dd",
                        //color: "#FFFFFF"
                    }}
                    variant="outlined"
                >
                    Column Select
                </Button>
                <ContentSearch
                    contents_api={contents_api}
                    metadata_api={metadata_api}
                    on_edit={row => {
                        this.update_state(draft => {
                            draft.modals.edit.is_open = true
                            draft.modals.edit.row = row
                        })
                    }}
                    on_view={row => {
                        this.update_state(draft => {
                            draft.modals.view.is_open = true
                            draft.modals.view.row = row
                        })
                    }}
                    on_toggle_active={row => {
                        this.props.show_toast_message(`Setting Active to ${!row.active}`, true)
                        Axios.patch(APP_URLS.CONTENT_ITEM(row.id), {
                            active: !row.active
                        }).then(
                            () => {
                                this.props.show_toast_message(`Active Set to ${!row.active}`, true)
                                return this.props.contents_api.load_content_rows()
                            },
                            () => this.props.show_toast_message("Active Toggle Failed", false)
                        )
                    }}
                />
                <ActionDialog
                    title={`Delete ${this.props.contents_api.state.selection.length} Content Item(s)?`}
                    open={this.state.modals.delete_content.is_open}
                    get_actions={(focus_ref: any) => [(
                        <Button
                            key={1}
                            onClick={()=> {
                                this.props.contents_api.delete_selection()
                                this.close_modals()
                            }}
                            color="secondary"
                        >
                            Delete
                        </Button>
                    ), (
                        <Button
                            key={2}
                            onClick={this.close_modals}
                            color="primary"
                            ref={focus_ref}
                        >
                            Cancel
                        </Button>
                    )]}
                >
                    <Typography>This action is irreversible</Typography>
                </ActionDialog>
                <ActionDialog
                    title="Bulk Download"
                    open={this.state.modals.bulk_download.is_open}
                    get_actions={(focus_ref: any) => [(
                        <Button
                            key={1}
                            onClick={()=> {
                                this.props.contents_api.bulk_download()
                                this.close_modals()
                            }}
                            color="secondary"
                        >
                            Download
                        </Button>
                    ), (
                        <Button
                            key={2}
                            onClick={this.close_modals}
                            color="primary"
                            ref={focus_ref}
                        >
                            Cancel
                        </Button>
                    )]}
                >
                    <Typography>Bulk download may take some time</Typography>
                </ActionDialog>
                <ContentModal
                    is_open={add.is_open}
                    on_close={() => {
                        this.update_state(draft => {
                            draft.modals.add.is_open = false
                        })
                    }}
                    metadata_api={metadata_api}
                    contents_api={this.props.contents_api}
                    modal_type={"add"}
                    validators={{
                        content_file: VALIDATORS.ADD_FILE,
                        title: VALIDATORS.TITLE,
                        description: VALIDATORS.DESCRIPTION,
                        year: VALIDATORS.YEAR,
                        reviewed_on: VALIDATORS.REVIEWED_ON,
                        metadata: VALIDATORS.METADATA,
                        copyright_notes: VALIDATORS.COPYRIGHT_NOTES,
                        rights_statement: VALIDATORS.RIGHTS_STATEMENT,
                        additional_notes: VALIDATORS.ADDITIONAL_NOTES,
                        duplicatable: () => ""
                    }}
                    show_toast_message={this.props.show_toast_message}
                    show_loader={this.props.show_loader}
                    remove_loader={this.props.remove_loader}
                />
                <ContentModal
                    is_open={edit.is_open}
                    on_close={() => {
                        this.update_state(draft => {
                            draft.modals.edit.is_open = false
                        })
                    }}
                    metadata_api={metadata_api}
                    contents_api={this.props.contents_api}
                    modal_type={"edit"}
                    row={edit.row}
                    validators={{
                        content_file: VALIDATORS.EDIT_FILE,
                        title: VALIDATORS.TITLE,
                        description: VALIDATORS.DESCRIPTION,
                        year: VALIDATORS.YEAR,
                        reviewed_on: VALIDATORS.REVIEWED_ON,
                        metadata: VALIDATORS.METADATA,
                        copyright_notes: VALIDATORS.COPYRIGHT_NOTES,
                        rights_statement: VALIDATORS.RIGHTS_STATEMENT,
                        additional_notes: VALIDATORS.ADDITIONAL_NOTES,
                        duplicatable: () => ""
                    }}
                    show_toast_message={this.props.show_toast_message}
                    show_loader={this.props.show_loader}
                    remove_loader={this.props.remove_loader}
                />
                <ViewContentModal
                    is_open={view.is_open}
                    metadata_api={metadata_api}
                    on_close={this.close_modals}
                    row={view.row}
                />
                <BulkContentModal
                    is_open={bulk_add.is_open}
                    on_close={() => {
                        this.update_state(draft => {
                            draft.modals.bulk_add.is_open = false
                        })
                    }}
                    show_toast_message={this.props.show_toast_message}
                    show_loader={this.props.show_loader}
                    remove_loader={this.props.remove_loader}>
               </BulkContentModal>
               <ActionDialog
                    open={this.state.modals.column_select.is_open}
                    title="Show Metadata Columns"
                    get_actions={focus_ref => [(
                        <Button
                            key={2}
                            onClick={() => {
                                this.update_state(draft => {
                                    draft.modals.column_select.is_open = false
                                })
                            }}
                            color="primary"
                            ref={focus_ref}
                        >
                            Close
                        </Button>
                    )]}
                >
                    {["filesize", "content_file", "rights_statement", "description", "modified_on", "reviewed_on", "copyright_notes", "published_year", "duplicatable"].map((name, idx) => {
                        return <Box flexDirection="row" display="flex" key={idx}>
                            <Box key={0}>
                                <Checkbox
                                    checked={this.props.metadata_api.state.show_columns[name]}
                                    onChange={(_, checked) => {
                                        this.props.metadata_api.set_view_metadata_column(draft => {
                                            draft[name] = checked
                                        })
                                    }}
                                />
                            </Box>
                            <Box key={1}>
                                <Typography>{name}</Typography>
                            </Box>
                        </Box>
                    })}
                    {this.props.metadata_api.state.metadata_types.map((metadata_type, idx) => {
                        return <Box flexDirection="row" display="flex" key={idx + 999}>
                            <Box key={0}>
                                <Checkbox
                                    checked={this.props.metadata_api.state.show_columns[metadata_type.name]}
                                    onChange={(_, checked) => {
                                        this.props.metadata_api.set_view_metadata_column(draft => {
                                            draft[metadata_type.name] = checked
                                        })
                                    }}
                                />
                            </Box>
                            <Box key={1}>
                                <Typography>{metadata_type.name}</Typography>
                            </Box>
                        </Box>
                    })}
                </ActionDialog>
            </React.Fragment>
        )
    }
}
