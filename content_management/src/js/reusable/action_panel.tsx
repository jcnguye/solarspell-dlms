import React from "react"
import { Edit, Delete, CheckCircleOutline, HighlightOff, Visibility, ArrowBack, CropOriginal, FileCopy, LocalOffer, GetApp } from "@material-ui/icons"
import Tooltip from "@material-ui/core/Tooltip/";

interface ActionPanelProps {
    row?: any,
    editFn?: () => void,
    deleteFn?: () => void,
    setActive?: (is_active: boolean) => void
    viewFn?: () => void
    addFn?: () => void
    imageFn?: () => void
    cloneFn?: () => void
    buildFn?: () => void
    downloadFn?: () => void
    editHint?: string
    deleteHint?: string
    viewHint?: string
    logoHint?: string
    cloneHint?: string
    metadataHint?: string
}

export default function ActionPanel(props:ActionPanelProps) {
    const { row, editFn, deleteFn, setActive, viewFn, addFn, imageFn, cloneFn, buildFn, downloadFn,
        editHint, deleteHint, viewHint, imageHint, cloneHint, metadataHint
    } = props
    const pointerStyle = {
        cursor: 'pointer'
    }
    return (
        <>
            {addFn !== undefined ? (
                <ArrowBack
                    style={pointerStyle}
                    onClick={addFn}
                />
            ) : (
                <></>
            )}
            {editFn !== undefined ? (
                <Tooltip title={editHint || ""}>
                    <Edit
                        style={pointerStyle}
                        onClick={editFn}
                    />
                </Tooltip>
            ) : (
                <></>
            )}
            {deleteFn !== undefined ? (
                <Tooltip title={deleteHint || ""}>
                    <Delete
                        style={pointerStyle}
                        onClick={deleteFn}
                    />
                </Tooltip>
            ) : (
                <></>
            )}
            {setActive !== undefined ? (
                row.active == 0 ? (
                    <CheckCircleOutline
                        style={pointerStyle}
                        onClick={() => setActive(true)}
                    />
                ) : (
                    <HighlightOff
                        style={pointerStyle}
                        onClick={() => setActive(false)}
                    />
                )
            ) : (
               <></> 
            )}
            {viewFn !== undefined ? (
                <Tooltip title={viewHint || ""}>
                    <Visibility
                        style={pointerStyle}
                        onClick={viewFn}
                    />
                </Tooltip>
            ) : (
                <></>
            )}
            {imageFn !== undefined ? (
                <Tooltip title={imageHint || ""}>
                    <CropOriginal
                        style={pointerStyle}
                        onClick={imageFn}
                    />
                </Tooltip>
            ) : <></>}
            {cloneFn !== undefined ? (
                <Tooltip title={cloneHint || ""}>
                    <FileCopy
                        style={pointerStyle}
                        onClick={cloneFn}
                    />
            </Tooltip>
            ) : <></>}
            {buildFn !== undefined ? (
                <Tooltip title={metadataHint || ""}>


                <LocalOffer
                    style={pointerStyle}
                    onClick={buildFn}
                />
            </Tooltip>
            ) : <></>}
            {downloadFn !== undefined ? (
                <GetApp
                    style={pointerStyle}
                    onClick={downloadFn}
                />
            ) : <></>}
        </>
    )
}
