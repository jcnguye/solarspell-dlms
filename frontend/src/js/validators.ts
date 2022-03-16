import { isString, isNull, isDate, isEqual } from 'lodash'
import { metadata_dict } from './types'

export default class VALIDATORS {
    static YEAR(year_str: any): string {
        if (year_str == "") {
            return ""
        }

        const year_num = parseInt(year_str)
        if (isNaN(year_num)) {
            return "Invalid Year"
        }
        if ((year_num < 1000) || year_num > (new Date().getFullYear())) {
            return "Invalid Year"
        }
        return ""
    }
    static METADATA(_metadata_arr: metadata_dict): string {
        return ""
    }
    static TITLE(title_str: any): string {
        if (title_str === "") {
            return "Field Required"
        }
        if (title_str.length > 300) {
            return "Title must be less than 300 characters"
        }
        return ""
    }
    static DISPLAY_TITLE(display_title_str: any): string {
        if (display_title_str === "") {
            return "Field Required"
        }
        if (display_title_str.length > 300) {
            return "Title must be less than 300 characters"
        }
        return ""
    }
    static DESCRIPTION(_description_str: any): string {
        return ""
    }
    static ADD_FILE(file_input: any): string {
        if (file_input === null) {
            return "Field Required"
        }
        if (file_input.name.length > 500) {
            return "Filename must be less than 500 characters"
        }
        return ""
    }
    static EDIT_FILE(file_input: any): string {
        if (file_input === null) return ""
        if (file_input.name.length > 500) {
            return "Filename must be less than 500 characters"
        }
        return ""
    }
    static COPYRIGHT_NOTES(copyright_notes_str: any): string {
        if (!isString(copyright_notes_str)) return ""
        if (copyright_notes_str.length >= 500) {
            return "Copyright Notes must be less than 500 characters"
        }
        return ""
    }
    static RIGHTS_STATEMENT(_rights_statement_str: any): string {
        return ""
    }
    static ADDITIONAL_NOTES(_: any): string {
        return ""
    }
    static REVIEWED_ON(reviewed_on: any): string {
        if (!isNull(reviewed_on) && !isDate(reviewed_on)) {
            return "Must be a valid date or nothing"
        }
        return ""
    }
    static DELETE_IF_EQUALS<T>(input_str: T, to_delete: T) {
        return isEqual(input_str, to_delete) ? "" : `Input must equal ${to_delete}`
    }
    static VERSION_NAME(to_check: any) {
        if (!isString(to_check)) {
            return "Input must be a string"
        }
        if (to_check.length < 0 || to_check.length > 300) {
            return "Input must be between 0 and 300 characters"
        }
        return ""
    }
    static VERSION_NUMBER(to_check: any) {
        if (!isString(to_check)) {
            return "Input must be a string"
        }
        if (to_check.length < 0 || to_check.length > 300) {
            return "Input must be between 0 and 300 characters"
        }
        return ""
    }
    static FOLDER_NAME(to_check: string) {
        if (!isString(to_check)) {
            return "Input must be a string"
        }
        if (to_check.length < 0 || to_check.length > 300) {
            return "Input must be between 0 and 300 characters"
        }
        return ""
    }
    static MODULE_NAME(to_check: string) {
        if (!isString(to_check)) {
            return "Input must be a string"
        }
        if (to_check.length < 0 || to_check.length > 300) {
            return "Input must be between 0 and 300 characters"
        }
        return ""
    }
}
