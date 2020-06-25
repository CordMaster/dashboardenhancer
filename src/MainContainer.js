import React, { useContext } from 'react';

import { makeStyles, ThemeProvider, CircularProgress, withWidth } from '@material-ui/core';

import { Switch, Route, Redirect } from 'react-router-dom';

import Settings from './endpoints/Settings.js';

import AppDrawer from './components/AppDrawer.js';
import AppBar from './components/AppBar.js';
import { MainContext } from './contexts/MainContextProvider.js';
import More from './endpoints/More.js';
import { LoadingContext } from './contexts/LoadingContextProvider.js';
import View from './endpoints/View';


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      flexFlow: 'column nowrap'
    },
    [theme.breakpoints.up('md')]: {
      flexFlow: 'row nowrap'
    }
  },

  content: {
    flex: '1 0 0',
    //another weird fix
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
    [theme.breakpoints.up('md')]: {
      height: '100%'
    }
  },

  main: {
    //cheap height fix
    height: '100%',

    whiteSpace: 'nowrap',
    overflow: 'auto',

    //for children
    position: 'relative'
  },

  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
}));

function MainContainer({ width }) {
  const classes = useStyles();

  const { loading } = useContext(LoadingContext);
  const { genTheme, config } = useContext(MainContext);

  const isSmall = width === 'sm' || width === 'xs';
  return (
    loading >= 100 ?
      <ThemeProvider theme={genTheme}>
        <div className={classes.root}>
          { !isSmall ? <AppDrawer /> : null }

          <div className={classes.content}>
            <main className={classes.main}>
              <Switch>
                <Route path="/settings" component={Settings} />
                <Route path="/more" component={More} />
                <Route exact path="/" render={() => <Redirect to={config.other.defaultDashboard === -1 ? 'settings/' + window.location.search : '' + config.other.defaultDashboard + '/' + window.location.search} />} />
                <Route path={/\/[0-9]+\//} render={({ location }) => <View index={parseInt(location.pathname.substr(1))} preload={!isSmall} isSmall={isSmall} />} />
              </Switch>
            </main>
          </div>

          { isSmall ? <AppBar /> : null }
        </div>
      </ThemeProvider> :
      <div className={classes.loader}>
        <CircularProgress size={100} variant="static" value={loading} />
      </div>
  );
}

export default withWidth()(MainContainer);
