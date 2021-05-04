import React from 'react';
import ReactDOM from 'react-dom';

import CssBaseline from '@material-ui/core/CssBaseline';

import MainScreen from './main';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { setAutoFreeze, enableMapSet } from 'immer';
import GlobalState from './context/global_state';

setAutoFreeze(false)
enableMapSet()

/*
* Load main screen
*/
ReactDOM.render(
    (<React.Fragment>
        <CssBaseline />
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <GlobalState render={MainScreen} />
        </MuiPickersUtilsProvider>
    </React.Fragment>)
    ,
    document.getElementById('container')
);
