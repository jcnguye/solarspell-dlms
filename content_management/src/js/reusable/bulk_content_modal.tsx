import ActionDialog from "./action_dialog"
import { isUndefined } from "lodash"
import {Button, Container, Typography, TextField} from "@material-ui/core"
import Axios, { AxiosResponse } from "axios"
import { APP_URLS } from "../urls"
import { Component } from 'react'
import React from 'react'
import {update_state, get_string_from_error, read_excel_file} from '../utils'

import {Grid as DataGrid, Table, TableHeaderRow} from "@devexpress/dx-react-grid-material-ui";
import {Column} from "@devexpress/dx-react-grid";

interface BulkContentModalProps {
    is_open: boolean
    show_toast_message: (message: string, is_success: boolean) => void
    on_close: () => void
    show_loader: () => void
    remove_loader: () => void
}

interface BulkContentModalState {
        error_table_rows: any // to display unsuccessful upload attempts
        bulk_content_path: string // to hold actual content files
        bulk_metadata: any // to hold content metadata
}

//This modal should be used to add bulk content with metadata excel sheet.
export default class BulkContentModal extends Component<BulkContentModalProps, BulkContentModalState> {

    update_state: (update_func: (draft: BulkContentModalState) => void) => Promise<void>
    bulk_add_files_ref: React.RefObject<HTMLInputElement>
    bulk_add_sheet_ref: React.RefObject<HTMLInputElement>
    error_table_columns: Column[]

    constructor(props: BulkContentModalProps) {
        super(props)
        this.bulk_add_files_ref = React.createRef()
        this.bulk_add_sheet_ref = React.createRef()
        this.error_table_columns = [{name:"file_name", title: "File Name"},{name:"error", title:"Error"}]
        this.state = {
            bulk_content_path: "",
            bulk_metadata: null,
            error_table_rows: []
        }
        this.update_state = update_state.bind(this)

    }
    render() {
        if (!this.props.is_open) return <></>
        return (
            <ActionDialog
                title={"Add Bulk Content and Metadata"}
                open={true}
                get_actions={focus_ref => [(
                    <Button
                        key={1}
                        onClick={() => {
                            this.props.on_close()
                            this.update_state(draft => {
                                draft.error_table_rows = []
                            })
                        }}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                ),(
                    <Button
                        key={2}
                        onClick={() => {
                            this.props.show_loader()
                                read_excel_file(this.bulk_add_sheet_ref.current?.files?.item(0))
                                .then(jsonArray => {
                                    this.update_state(draft => {
                                        draft.bulk_metadata = jsonArray;
                                    })
                                })
                                .then(() => {
                                    const axios_response = Axios.post(APP_URLS.CONTENT_BULK,
                                        {"sheet_data":this.state.bulk_metadata,
                                            "content_path": this.state.bulk_content_path})
                                    axios_response.then((_res?: AxiosResponse<any>) => {
                                        this.props.remove_loader()
                                        this.props.show_toast_message(`${_res?.data?.data?.success_count} Content Added Successfully`,true)
                                        this.update_state(draft => {
                                            draft.error_table_rows = []
                                            draft.error_table_rows = _res?.data?.data?.unsuccessful_uploads
                                         })
                                    }, (reason: any) => {
                                        this.props.remove_loader()
                                        const unknown_err_str =  "Error while adding bulk content"
                                        this.props.show_toast_message(get_string_from_error(
                                            isUndefined(reason?.response?.data?.error) ? reason?.response?.data?.error : unknown_err_str,
                                            unknown_err_str
                                        ),false)
                                    })
                            })
                        }}
                        color="primary"
                        ref={focus_ref}
                    >
                        Add Files
                    </Button>
                )]}
            >
                <Container style={{marginBottom: "1em"}}>
                    <Typography>Content File Location</Typography>
                    <TextField
                        fullWidth
                        label={"File Location (eg. F://EA_Content)"}
                        value={this.state.bulk_content_path}
                        onChange={(evt) => {
                            evt.persist()
                            this.update_state(draft => {
                                draft.bulk_content_path = evt.target.value
                            })
                        }}
                    />
                </Container>
                <Container style={{marginBottom: "1em"}}>
                   <Typography>Add Metadata File</Typography>
                    <input type="file"  ref={this.bulk_add_sheet_ref}/>
                </Container>
                {this.state.error_table_rows.length > 0 ? (
                    <DataGrid
                        columns={this.error_table_columns}
                        rows={this.state.error_table_rows}
                    >
                        <Table />
                        <TableHeaderRow />
                    </DataGrid>) : <></>
                }
           </ActionDialog>
        )
    }
}
