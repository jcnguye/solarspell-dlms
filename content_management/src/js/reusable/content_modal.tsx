import ActionDialog from "./action_dialog"
import { cloneDeep, isEqual, set, isNull, isString, isArray, isUndefined } from "lodash"
import { Button, TextField, Grid, Checkbox, Typography } from "@material-ui/core"
import Axios, { AxiosResponse } from "axios"
import { APP_URLS } from "../urls"
import { Autocomplete, createFilterOptions } from "@material-ui/lab"
import { Component, RefObject } from 'react'
import React from 'react'
import { update_state, get_field_info_default } from '../utils'

import { KeyboardDatePicker }   from '@material-ui/pickers';
import { format } from 'date-fns'
import {
    WrappedFieldInfo, metadata_dict, SerializedContent, MetadataAPI,
    SerializedMetadata, SerializedMetadataType, content_fields, ContentsAPI
} from '../types'

interface ContentModalProps {
    is_open: boolean
    modal_type: "add" | "edit"
    row?: SerializedContent
    validators: {
        [P in keyof content_fields]: (value: any) => string
    }
    metadata_api: MetadataAPI
    contents_api: ContentsAPI
    show_toast_message: (message: string, is_success: boolean) => void
    on_close: () => void
    show_loader: () => void
    remove_loader: () => void
}

interface ContentModalState {
    fields: WrappedFieldInfo<content_fields>
}


//This modal should be used to add a new content item or edit an existing one.
export default class ContentModal extends Component<ContentModalProps, ContentModalState> {

    update_state: (update_func: (draft: ContentModalState) => void) => Promise<void>
    default_fields: WrappedFieldInfo<content_fields>
    file_input_ref: RefObject<HTMLInputElement>

    auto_complete_filter: any

    constructor(props: ContentModalProps) {
        super(props)

        this.file_input_ref = React.createRef()

        this.default_fields = {
            content_file: get_field_info_default<File|null>(null),
            title: get_field_info_default(""),
            display_title: get_field_info_default(""),
            description: get_field_info_default(""),
            year: get_field_info_default(""),
            reviewed_on: get_field_info_default(null),
            metadata: get_field_info_default(
                this.props.metadata_api.state.metadata_types.reduce((acc, current) => {
                    acc[current.name] = []
                    return acc
                },{} as metadata_dict)),
            rights_statement: get_field_info_default(""),
            additional_notes: get_field_info_default(""),
            copyright_notes: get_field_info_default(""),
            duplicatable: get_field_info_default(false),
            active: get_field_info_default(true)
        }

        this.state = {
            fields: cloneDeep(this.default_fields)
        }

        this.auto_complete_filter = createFilterOptions<(string | SerializedMetadata)[]>({
            ignoreCase: true
        })
        this.update_state = update_state.bind(this)
    }

    componentDidUpdate(prevProps: ContentModalProps, _prevState: ContentModalState) {
        if (this.props.modal_type === "edit"
            && this.props.row !== undefined
            && !isEqual(this.props.row, prevProps.row)) {
            const row = this.props.row
            const metadata = this.props.metadata_api.state.metadata_types
                .reduce((prev, metadata_type) => {
                    const filtered = row.metadata_info.filter(
                        to_check => isEqual(to_check.type, metadata_type.id))
                    return set(prev, [metadata_type.name], filtered)
                }, {} as metadata_dict)

            this.update_state(draft => {
                draft.fields.content_file = get_field_info_default(null)
                draft.fields.copyright_notes = get_field_info_default(
                    row.copyright_notes === null ? "" : row.copyright_notes)
                draft.fields.description = get_field_info_default(
                    row.description === null ? "" : row.description)
                draft.fields.metadata = get_field_info_default(metadata)
                draft.fields.rights_statement = get_field_info_default(
                    row.rights_statement === null? "" : row.rights_statement)
                draft.fields.additional_notes = get_field_info_default(
                    row.additional_notes === null? "" : row.additional_notes)
                draft.fields.title = get_field_info_default(
                    row.title === null ? "" : row.title)
                draft.fields.display_title = get_field_info_default(
                    row.display_title === null ? "" : row.display_title)
                draft.fields.year = get_field_info_default(
                    row.published_year === null ? "" : row.published_year)
                draft.fields.duplicatable = get_field_info_default(row.duplicatable)
                draft.fields.active = get_field_info_default(row.active)
            })
        } else {
            if (!isEqual(this.props.metadata_api.state.metadata_types,
                prevProps.metadata_api.state.metadata_types)) {
                this.props.metadata_api.state.metadata_types.map(type => {
                    this.update_state(draft => {
                        if (!(type.name in draft.fields.metadata.value)) {
                            draft.fields.metadata.value[type.name] = []
                        }
                    })
                })
            }
        }
    }

    render() {
        if (!this.props.is_open) return <></>
        return (
            <ActionDialog
                title={this.props.modal_type === "add" ?
                    "Add new content item" : `Edit content ${this.props.row?.title}`}
                open={true}
                get_actions={focus_ref => [(
                    <Button
                        key={1}
                        onClick={this.props.on_close}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                ), (
                    <Button
                        key={2}
                        onClick={() => {
                            this.props.show_loader()
                            this.update_state(draft => {
                                const file_raw = this.file_input_ref.current?.files?.item(0)
                                draft.fields.content_file.value = typeof(file_raw) === "undefined" ? null : file_raw
                            })
                                .then(() => this.update_state(draft => {
                                    Object.keys(this.state.fields).map((field) => {
                                    const cast_field = field as keyof content_fields
                                    console.log("cast_field: ", cast_field);
                                    draft.fields[cast_field].reason = this.props.validators[cast_field](
                                        draft.fields[cast_field].value
                                    )
                                })
                            }))
                            .then(() => {
                                for (const key in this.state.fields) {
                                    if (this.state.fields[key as keyof content_fields].reason !== "") {
                                        this.props.remove_loader()
                                        return
                                    }
                                }

                                //Form data instead of js object needed so the file upload works as multipart
                                //There might be a better way to do this with Axios
                                const formData = new FormData()

                                const file = this.state.fields.content_file.value
                                if (file !== null) {
                                    formData.append('content_file', file)
                                } else {
                                    if (this.props.modal_type === "add") return
                                }

                                formData.append('title', this.state.fields.title.value)
                                formData.append('display_title', this.state.fields.display_title.value)
                                formData.append('description', this.state.fields.description.value)
                                formData.append('duplicatable', this.state.fields.duplicatable.value ? "true" : "false")
                                formData.append('rights_statement', this.state.fields.rights_statement.value)
                                formData.append('additional_notes', this.state.fields.additional_notes.value)
                                formData.append('copyright_notes', this.state.fields.copyright_notes.value)
                                if (this.state.fields.year.value !== "") {
                                    formData.append('published_date', `${this.state.fields.year.value}-01-01`)
                                }
                                if (this.props.modal_type === "add") {
                                    formData.append('active', "true")
                                } else {
                                    formData.append('active', this.state.fields.active.value ? "true" : "false")
                                }
                                if (!isNull(this.state.fields.reviewed_on.value)) {
                                    formData.append("reviewed_on", format(this.state.fields.reviewed_on.value, "yyyy-MM-dd"))
                                }
                                this.props.metadata_api.state.metadata_types
                                    .map(type => {
                                    if (type.name in this.state.fields.metadata.value) {
                                        this.state.fields.metadata.value[type.name].map(metadata => {
                                            formData.append("metadata", `${metadata.id}`)
                                        })
                                    }
                                })

                                //We have to do this weird pattern so the only caught errors in this promise chain come from the axios call
                                const axios_response = this.props.modal_type === "add" ?
                                    Axios.post(APP_URLS.CONTENT, formData, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }) : Axios.patch(APP_URLS.CONTENT_ITEM(this.props.row === undefined ? 0 : this.props.row.id), formData, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    })
                                axios_response.then((_res?: AxiosResponse<any>) => {
                                    this.props.remove_loader()
                                    this.props.show_toast_message(this.props.modal_type === "add" ? "Added content successfully" : "Edited content successfully",true)
                                    this.props.metadata_api.refresh_metadata()
                                    this.props.contents_api.load_content_rows()
                                    this.props.on_close()
                                    this.update_state(draft => {
                                        draft.fields = cloneDeep(this.default_fields)
                                    })
                                }, (reason: any) => {
                                    this.props.remove_loader()
                                    const unknown_err_str = this.props.modal_type === "add" ? "Error while adding content" : "Error while editing content"
                                    const err = reason?.response?.data?.error
                                    const err_string = err === undefined ?
                                        unknown_err_str : isArray(err) ? 
                                            err[0] : isString(err) ?
                                                err : Object.values(err)[0]
                                    
                                    this.props.show_toast_message(err_string, false)
                                })
                            })
                        }}
                        color="primary"
                        ref={focus_ref}
                    >
                        {this.props.modal_type === "add" ? "Add" : "Save"}
                    </Button>
                )]}
                >
                <Grid container>
                    {[
                        <TextField
                            fullWidth
                            error={this.state.fields.title.reason !== ""}
                            helperText={this.state.fields.title.reason}
                            label={"Title"}
                            value={this.state.fields.title.value}
                            onChange={(evt) => {
                                evt.persist()
                                this.update_state(draft => {
                                    draft.fields.title.value = evt.target.value
                                })
                            }}
                        />,
                        <TextField
                            fullWidth
                            error={this.state.fields.display_title.reason !== ""}
                            helperText={this.state.fields.display_title.reason}
                            label={"Display Title"}
                            value={this.state.fields.display_title.value}
                            onChange={(evt) => {
                                evt.persist()
                                this.update_state(draft => {
                                    draft.fields.display_title.value = evt.target.value
                                })
                            }}
                        />,
                        <TextField
                            fullWidth
                            error={this.state.fields.description.reason !== ""}
                            helperText={this.state.fields.description.reason}
                            label={"Description"}
                            value={this.state.fields.description.value}
                            onChange={(evt) => {
                                evt.persist()
                                this.update_state(draft => {
                                    draft.fields.description.value = evt.target.value
                                })
                            }}
                        />,
                        <>
                            {
                                this.props.row?.content_file ? 
                                    <Typography>Existing file: {this.props.row?.file_name}</Typography> :
                                    null
                            }
                            <input
                                accept="*"
                                id="raised-button-file"
                                type="file"
                                ref={this.file_input_ref}
                            />
                        </>,
                        <TextField
                            fullWidth
                            error={this.state.fields.year.reason !== ""}
                            helperText={this.state.fields.year.reason}
                            label={"Year of Publication"}
                            value={this.state.fields.year.value}
                            onChange={(evt) => {
                                evt.persist()
                                this.update_state(draft => {
                                    draft.fields.year.value = evt.target.value
                                })
                            }}
                        />,
                        <KeyboardDatePicker
                            disableToolbar
                            variant={"inline"}
                            format={"MM/dd/yyyy"}
                            value={this.state.fields.reviewed_on.value}
                            label={"Reviewed Date"}
                            onChange={value => {
                                this.update_state(draft => {
                                    draft.fields.reviewed_on.value = value
                                })
                            }}
                        />,
                        <TextField
                            fullWidth
                            error={this.state.fields.copyright_notes.reason !== ""}
                            helperText={this.state.fields.copyright_notes.reason}
                            label={"Copyright Notes"}
                            value={this.state.fields.copyright_notes.value}
                            onChange={(evt) => {
                                evt.persist()
                                this.update_state(draft => {
                                    draft.fields.copyright_notes.value = evt.target.value
                                })
                            }}
                        />,
                        <TextField
                            fullWidth
                            error={this.state.fields.rights_statement.reason !== ""}
                            helperText={this.state.fields.rights_statement.reason}
                            label={"Rights Statement"}
                            value={this.state.fields.rights_statement.value}
                            onChange={(evt) => {
                                evt.persist()
                                this.update_state(draft => {
                                    draft.fields.rights_statement.value = evt.target.value
                                })
                            }}
                        />,
                        <>
                            <Typography>Duplicatable</Typography>
                            <Checkbox
                                checked={this.state.fields.duplicatable.value}
                                onChange={(_evt, checked) => {
                                    this.update_state(draft => {
                                        draft.fields.duplicatable.value = checked
                                    })
                                }}
                            />
                        </>,
                        ...(this.props.modal_type === "add" ? [] : [
                            <>
                                <Typography>Active</Typography>
                                <Checkbox
                                    checked={this.state.fields.active.value}
                                    onChange={(_evt, checked) => {
                                        this.update_state(draft => {
                                            draft.fields.active.value = checked
                                        })
                                    }}
                                />
                            </>
                        ]),
                        this.props.metadata_api.state.metadata_types
                            .map((metadata_type: SerializedMetadataType, idx) => {
                            return (
                                <Grid item key={idx}>
                                    <Autocomplete
                                        multiple
                                        value={this.state.fields
                                            .metadata.value[metadata_type.name]}
                                        onChange={(_evt, value: SerializedMetadata[]) => {
                                            //Determine which tokens are real or generated
                                            //by the "Add new metadata ..." option
                                            let valid_meta = value.filter(
                                                to_check => to_check.id !== 0
                                            )
                                            let add_meta_tokens = value.filter(
                                                to_check => to_check.id === 0
                                            )
                                            if (add_meta_tokens.length > 0) {
                                                const to_add = add_meta_tokens[0]
                                                this.props.metadata_api.add_metadata(
                                                    to_add.name, metadata_type
                                                ).then(res => {
                                                    //add the created metadata to
                                                    //valid_metadata with its new id
                                                    valid_meta.push(res?.data)
                                                    add_meta_tokens = []
                                                })
                                                .then(() => {
                                                    this.props.metadata_api.refresh_metadata()
                                                })
                                                .then(() => {
                                                    this.update_state(draft => {
                                                        draft.fields.metadata
                                                            .value[metadata_type.name]
                                                            = valid_meta
                                                    })
                                                })
                                            } else {
                                                this.update_state(draft => {
                                                    draft.fields.metadata
                                                        .value[metadata_type.name]
                                                        = valid_meta
                                                })
                                            }

                                        }}
                                        filterOptions={(options, params) => {
                                            const filtered = this.auto_complete_filter(
                                                options, params
                                            )
                                            const already_loaded_metadata = this.props
                                                .metadata_api.state
                                                .metadata_by_type[metadata_type.name]
                                                ?.find(match =>
                                                    match.name == params.inputValue)
                                            if (
                                                params.inputValue !== '' &&
                                                isUndefined(already_loaded_metadata)
                                            ) {
                                                filtered.push({
                                                    id: 0,
                                                    name: params.inputValue,
                                                    type: metadata_type.id,
                                                    type_name: metadata_type.name
                                                } as SerializedMetadata)
                                            }
                                            return filtered
                                        }}
                                        handleHomeEndKeys
                                        options={this.props.metadata_api.state
                                            .autocomplete_metadata[metadata_type.name] || []}
                                        getOptionLabel={option => {
                                            if (isUndefined(option)) {
                                                return "undefined"
                                            }
                                            return option.id === 0 ?
                                                `Add new Metadata "${option.name}"` :
                                                option.name
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                error={this.state.fields
                                                    .metadata.reason !== ""}
                                                helperText={this.state
                                                    .fields.metadata.reason}
                                                {...params}
                                                variant={"standard"}
                                                label={metadata_type.name}
                                                placeholder={metadata_type.name}
                                            />
                                        )}
                                        onInputChange={(_, name) => {
                                            this.props.metadata_api
                                                .update_autocomplete(
                                                    metadata_type, name
                                                )
                                        }}
                                    />
                                </Grid>
                            )
                        }),
                        <TextField
                            fullWidth
                            rows={3}
                            error={this.state.fields.additional_notes.reason !== ""}
                            helperText={this.state.fields.additional_notes.reason}
                            label={"Additional Notes"}
                            value={this.state.fields.additional_notes.value}
                            onChange={(evt) => {
                                evt.persist()
                                this.update_state(draft => {
                                    draft.fields.additional_notes.value = evt.target.value
                                })
                            }}
                        />,
                    ].map((element, idx) => (
                        <Grid item key={idx} xs={12} style={{marginBottom: "10px"}}>
                            {element}
                        </Grid>
                    ))}
                </Grid> 
            </ActionDialog>
        )
    }
}
