import React from 'react';

import HomeScreen from "./home_screen"
import Metadata from "./metadata"
import Content from "./content"

import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import solarSpellLogo from '../images/logo2.png'; 
import '../css/style.css';

import contents from "../images/home_icons/contents.png"
import system_info from "../images/home_icons/system_info.png"
import library_versions from "../images/home_icons/library_versions.png"
import metadata from "../images/home_icons/metadata.png"
import solarspell_images from "../images/home_icons/solarspell_images.png"
import library_assets from "../images/home_icons/library_assets.png"
import library_modules from "../images/home_icons/library_modules.png"

import { Snackbar, CircularProgress, Box} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { update_state } from './utils';
import { APIs, TabDict } from './types';
import LibraryAssets from './library_assets';
import Libraries from './libraries';
import LibraryImages from './library_images';
import SystemInfo from './system_info';
import LibraryModules from "./library_modules";

interface MainScreenProps {
    apis: APIs
}

interface MainScreenState {
    url: URL,
    current_tab: string
    toast_state: {
        message: string
        is_open: boolean
        is_success: boolean
        last_open: number
    }
    loader_state: {
        loading: boolean
    }
    has_error: boolean
}

class MainScreen extends React.Component<MainScreenProps, MainScreenState> {
    tabs: TabDict
    update_state: (update_func: (draft: MainScreenState) => void) => Promise<void>
    constructor(props: MainScreenProps) {
        super(props)
        
        this.change_tab = this.change_tab.bind(this)

        this.tabs = {
            "home": {
                display_label: <img src={solarSpellLogo} className="spellLogo" />,
                component: (tabs, _apis) => <HomeScreen change_tab={this.change_tab} tabs={tabs}/>,
                icon: null
            },
            "metadata": {
                display_label: "Metadata",
                component: (_tabs, apis) => (
                    <Metadata
                        metadata_api={apis.metadata_api}
                        show_toast_message={this.show_toast_message}
                    />
                ),
                icon: metadata
            },
            "contents": {
                display_label: "Contents",
                component: (_tabs, apis) => (
                    <Content
                        metadata_api={apis.metadata_api}
                        show_toast_message={this.show_toast_message}
                        close_toast={this.close_toast}
                        contents_api={apis.contents_api}
                        show_loader={this.show_loader}
                        remove_loader={this.remove_loader}
                    />
                ),
                icon: contents
            },
            "library_assets": {
            display_label: "Library Assets",
                component: (_tabs, apis) => (
                    <LibraryAssets
                        library_assets_api={apis.lib_assets_api}
                    />
                ),
                icon: library_assets
            },
            "modules": {
            display_label: "Modules",
                component: (_tabs, apis) => (
                    <LibraryModules
                        library_modules_api={apis.lib_modules_api}
                        library_assets_api={apis.lib_assets_api}
                    />
                ),
                icon: library_modules
            },
            "libraries": {
                display_label: "Libraries",
                component: (_tabs, apis) => (
                    <Libraries 
                        library_versions_api={apis.lib_versions_api}
                        library_assets_api={apis.lib_assets_api}
                        users_api={apis.users_api}
                        metadata_api={apis.metadata_api}
                        contents_api={apis.contents_api}
                        library_modules_api={apis.lib_modules_api}
                        show_toast_message={this.show_toast_message}
                    />
                ),
                icon: library_versions
            },
            "images": {
                display_label: "SolarSPELL Images",
                component: (_tabs, apis) => (
                    <LibraryImages library_versions_api={apis.lib_versions_api}/>
                ),
                icon: solarspell_images
            },
            "system_info": {
                display_label: "System Info",
                component: (_tabs, apis) => <SystemInfo utils_api={apis.utils_api} />,
                icon: system_info
            }
        }


        const url = new URL(window.location.href)

        const default_tab = Object.keys(this.tabs)[0]
        const tab_value = url.searchParams.get("tab")

        this.state = {
            //Makes sure current_tab exists and is actually a key in this.tabs otherwise set to default
            url,
            current_tab: tab_value === null ?
                default_tab :
                (tab_value in this.tabs ? tab_value : default_tab),
            toast_state: {
                message: "",
                is_open: false,
                is_success: false,
                last_open: Date.now()
            },
            loader_state:{
                loading:false
            },
            has_error: false,
        }

        this.close_toast = this.close_toast.bind(this)
        this.show_toast_message = this.show_toast_message.bind(this)
        this.show_loader = this.show_loader.bind(this)
        this.remove_loader = this.remove_loader.bind(this)
        this.update_state = update_state.bind(this)
    }

    //Closes the toast message window
    close_toast() {
        const now = Date.now()
        console.log(now, this.state.toast_state.last_open)
        if (this.state.toast_state.last_open + 5000 <= now) {
            this.update_state(draft => {
                draft.toast_state.is_open = false
                draft.toast_state.message = ""
            })
        }
    }

    //Opens the toast message and shows the window
    show_toast_message(message: string, is_success: boolean) {
        this.update_state(draft => {
            draft.toast_state.is_open = true
            draft.toast_state.message = message
            draft.toast_state.is_success = is_success
        }).then(() => setTimeout(this.close_toast, 5000))
    }

    change_tab(new_tab: string) {
        this.update_state(draft => {
            const new_url = new URL(draft.url.toString())
            new_url.searchParams.set("tab", new_tab)
            draft.url = new_url
            draft.current_tab = new_tab
        }).then(() => {
            history.replaceState({}, "DLMS", this.state.url.toString())
        })
            .then(this.props.apis.contents_api.reset_search)
            .then(this.props.apis.lib_versions_api.reset_to_defaults)
            .then(this.props.apis.contents_api.load_content_rows)
    }
    show_loader(){
        this.update_state(draft => {
            draft.loader_state.loading = true
        })
    }
    remove_loader(){
        this.update_state(draft => {
            draft.loader_state.loading = false
        })
    }

    render() {
        const tabs_jsx = Object.entries(this.tabs).map(([tab_name, tab_data]) => {
            return <Tab key={tab_name} value={tab_name} label={(tab_data as any).display_label} />
        })
        
        if (this.state.has_error) {
            return <h1>An Error has Occurred 😭</h1>
        }

        return (
            <React.Fragment>
                <Grid container justify="center" alignItems="center" style={{height: '100%'}}>
                    <Tabs
                        value={this.state.current_tab}
                        TabIndicatorProps={{style: {backgroundColor: '#75B2DD', height: '5px', borderRadius: '5px'}}}
                        onChange={(_, value) => {this.change_tab(value)}}
                        indicatorColor="secondary"
                        variant="scrollable"
                    >
                        {tabs_jsx}
                    </Tabs>
                </Grid>
                <Grid style={{marginTop: '20px'}}>
                    {this.tabs[this.state.current_tab].component(this.tabs, this.props.apis)}  
                </Grid>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    
                    open={this.state.toast_state.is_open}
                    onClose={this.close_toast}
                    autoHideDuration={6000}
                >
                    <Alert severity={this.state.toast_state.is_success ? "success" : "error"}>
                        {this.state.toast_state.message}
                    </Alert>
                </Snackbar>
                <Box
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    top = "50%"
                    right = "50%"
                    zIndex = "10001"
                >
                    {(this.state.loader_state.loading || this.props.apis.utils_api.state.outstanding_requests.size > 0)
                        && <CircularProgress color="primary"/>}
                </Box>
            </React.Fragment>
        )
    }
}

export default MainScreen;
