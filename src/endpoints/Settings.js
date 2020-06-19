import React, { useState, useEffect, useContext, Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';

import { makeStyles, CircularProgress, Snackbar, SnackbarContent, Select } from '@material-ui/core';

import { Grid, Paper, Typography, TextField, MenuItem, Button, Switch, FormControlLabel, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, FormControl, FormLabel, RadioGroup, Radio, ThemeProvider } from '@material-ui/core';

import { Alert, ToggleButton } from '@material-ui/lab';

import Icons, { getIcon } from '../Icons';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MainContext } from '../contexts/MainContextProvider';

import IconSelectDialog from '../components/IconSelectDialog.js';
import ColorPicker from '../components/colorpicker/ColorPicker.js';
import DevicePicker from '../components/devicepicker/DevicePicker.js';
import { HubContext } from '../contexts/HubContextProvider.js';
import settingsDefinitons from '../definitions/settingsDefinitons';
import { useSectionRenderer } from '../definitions/useSettingsDefinition';

const useStyles = makeStyles(theme => ({
  settingsPaper: {
    paddingTop: theme.spacing(2),
    minHeight: '100%'
  },

  settingsHeader: {
    marginBottom: theme.spacing(2)
  },

  saveBtn: {
    float: 'right'
  }
}));

function Settings() {
  const classes = useStyles();

  const { config, setConfig, save, ...state } = useContext(MainContext);

  const [snackbarContent, setSnackbarContent] = useState({ value: '', type: '' });

  const handleSave = () => {
    save().done(() => {
      setSnackbarContent({ value: "Successfully saved settings!", type: 'success' });
    }).fail(() => {
      setSnackbarContent({ value: "There was an error saving your settings.", type: 'error' });
    });
  }

  const compiledSettings = useMemo(() => { 
    return Object.entries(settingsDefinitons).map(([sectionName, section]) => {
      if(!section.noShow) {
        return <DerrivedSettingsSection key={sectionName} sectionName={sectionName} section={section} config={config} setConfig={setConfig} state={state} />
      } else {
        return null;
      }
    });
  }, [config, setConfig]);


  return (
    <Paper square elevation={0} className={classes.settingsPaper}>
      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={snackbarContent.value !== ''} autoHideDuration={5000} onClose={() => setSnackbarContent({ value: '', type: '' })}>
        <Alert severity={snackbarContent.type} onClose={() => setSnackbarContent({ value: '', type: '' })}>
          <Typography color="textSecondary" variant="inherit">
            {snackbarContent.value}
          </Typography>
        </Alert>
      </Snackbar>

      <Grid container direction="row" wrap="nowrap" justify="center">
        <Grid item xs={11} sm={10}>
          <Typography variant="h5" gutterBottom className={classes.settingsHeader}>
            Settings
            <Button variant="contained" color="primary" onClick={handleSave} className={classes.saveBtn}>Save</Button>
          </Typography>
          
          <DashboardsSettings />

          <TileDefinitionsSettings />

          {compiledSettings}

          <SettingsSection title="Legal">
            <Button variant="outlined" color="secondary" onClick={() => window.location.assign('https://cdn.plumpynuggets.com/attribution.txt')}>Licenses</Button>
          </SettingsSection>
        </Grid>
      </Grid>
    </Paper>
  );
}

const useSectionStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    whiteSpace: 'normal'
  },

  button: {
    float: 'right'
  }
}));

const SettingsSection = React.memo(({ title, button, buttonLabel, onButtonClick, className, children, ...props }) => {
  const classes = useSectionStyles();

  return (
    <Paper className={`${classes.paper} ${className}`} {...props}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
        { button ?
          <Button variant="contained" color="primary" size="small" onClick={onButtonClick} className={classes.button}>{buttonLabel}</Button>
          : null
        }
      </Typography>
      {children}
    </Paper>
  );
});

const useDSSStyles = makeStyles(theme => ({
  noDisplay: {
    display: 'none'
  }
}));

const DerrivedSettingsSection = React.memo(({ sectionName, section, config, setConfig, state }) => {
  const classes = useDSSStyles();

  const [children, handleSave, noShow] = useSectionRenderer(section, config, setConfig, state);

  return (
    <SettingsSection className={noShow && classes.noDisplay} key={sectionName} title={section.sectionLabel} button={section.saveBuffer} buttonLabel="Apply" onButtonClick={handleSave}>
      {children}
    </SettingsSection>
  );
});

const usePSStyles = makeStyles(theme => ({
  listContainer: {
    margin: `0 ${theme.spacing(-2)}px`,
    "&:last-child": {
      marginBottom: theme.spacing(-2)
    }
  },

  dropArea: {
    minHeight: theme.spacing(10),

    position: 'relative'
  },

  helperText: {
    display: 'block',
    position: 'absolute',
    
    top: '50%',
    left: '50%',

    transform: 'translate(-50%, -50%)'
  }
}));

function DashboardsSettings() {
  const classes = usePSStyles();

  const { dashboards, modifyDashboards, config, setConfig } = useContext(MainContext);
  const defaultDashboard = config.defaultDashboard;
  const setDefaultDashboard = setConfig.defaultDashboard;

  const [newText, setNewText] = useState('');

  const handleAdd = () => {
    modifyDashboards({ type: 'new', data: { label: newText } });

    if(defaultDashboard === -1) setDefaultDashboard(0);

    setNewText('');
  }

  const handleEnd = result => {
    const {source, destination} = result;
    
    if(source.droppableId === destination.droppableId) {
      modifyDashboards({ type: 'move', startIndex: source.index, destIndex: destination.index });

      //update the default too
      if(defaultDashboard === source.index) setDefaultDashboard(destination.index);
      else if(defaultDashboard === destination.index) setDefaultDashboard(source.index)
    }
  }

  const uiDashboards = dashboards.map((dashboard, index) => {
    const onDelete = () => {
      if(defaultDashboard === index) {
        if(dashboards.length > 1) setDefaultDashboard(0);
        else setDefaultDashboard(-1);
      }
    }

    const handleToggleLock = () => {
      modifyDashboards({type: 'modify', index, data: { lock: !dashboard.lock } });
    }

    return (
      <DraggableListItem key={dashboard.id} index={index} data={dashboard} modifyData={(action) => modifyDashboards(Object.assign({ index, ...action }))} onDelete={onDelete} >
        <Switch checked={defaultDashboard === index} onChange={() => setDefaultDashboard(index)} />
        <ToggleButton size="small" selected={dashboard.lock} onChange={() => handleToggleLock()}>Child Lock</ToggleButton>
      </DraggableListItem>
    );
  });

  return (
    <DragDropContext onDragEnd={handleEnd}>
      <SettingsSection title="Dashboards">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={10}>
              <TextField fullWidth label="Dashboard name" value={newText} onChange={e => setNewText(e.target.value)} />
            </Grid>

            <Grid item xs={2}>
              <Button fullWidth variant="contained" onClick={handleAdd}>Add</Button>
            </Grid>
          </Grid>
          <div className={classes.listContainer}>
            <Droppable droppableId="dashboards-enabled">
              {(provided, snapshot) => (
                <div className={classes.dropArea} ref={provided.innerRef}>
                  {uiDashboards.length > 0 ?
                    <List>
                      <Divider />

                      {uiDashboards}

                      {provided.placeholder}
                    </List> :
                    <Typography align="center" className={classes.helperText}>Create a dashboard above</Typography>
                  }
                </div>
              )}
            </Droppable>
          </div>
        </SettingsSection>
    </DragDropContext>
  );
}

function TileDefinitionsSettings() {
  const classes = usePSStyles();

  const { tileDefinitions, modifyTileDefinitions } = useContext(MainContext);

  const [newText, setNewText] = useState('');

  const handleAdd = () => {
    modifyTileDefinitions({ type: 'new', data: { label: newText } });

    setNewText('');
  }

  const handleEnd = result => {
    const {source, destination} = result;
    
    if(source.droppableId === destination.droppableId) {
      modifyTileDefinitions({ type: 'move', startIndex: source.index, destIndex: destination.index });
    }
  }

  const uiTileDefinitions = tileDefinitions.map((tileDefinition, index) => {
    return (
      <DraggableListItem key={tileDefinition.id} index={index} data={tileDefinition} modifyData={(action) => modifyTileDefinitions(Object.assign({ index, ...action }))}>
      </DraggableListItem>
    );
  });

  return (
    <DragDropContext onDragEnd={handleEnd}>
      <SettingsSection title="Tile Defintions">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={10}>
              <TextField fullWidth label="Tile definition name" value={newText} onChange={e => setNewText(e.target.value)} />
            </Grid>

            <Grid item xs={2}>
              <Button fullWidth variant="contained" onClick={handleAdd}>Add</Button>
            </Grid>
          </Grid>
          <div className={classes.listContainer}>
            <Droppable droppableId="dashboards-enabled">
              {(provided, snapshot) => (
                <div className={classes.dropArea} ref={provided.innerRef}>
                  {uiTileDefinitions.length > 0 ?
                    <List>
                      <Divider />

                      {uiTileDefinitions}

                      {provided.placeholder}
                    </List> :
                    <Typography align="center" className={classes.helperText}>Create a tile definition</Typography>
                  }
                </div>
              )}
            </Droppable>
          </div>
        </SettingsSection>
    </DragDropContext>
  );
}

const useLItems = makeStyles(theme => ({
  listItem: {
    padding: theme.spacing(2)
  },

  listItemIcon: {
    //marginRight: -theme.spacing.unit
    //cursor: 'pointer'
  },

  editTextField: {
    marginLeft: theme.spacing(2)
  }
}));

function DraggableListItem({ index, data, modifyData, children, ...props }) {
  const classes = useLItems();

  const [editMode, setEditMode] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label);
  const [selectIconOpen, setSelectIconOpen] = useState(false);
  

  const handelLabelChange = (e) => {
    const value = e.target.value;
    if(e.key === 'Enter') {
      modifyData({ type: 'modify', data: { label: value } });
      setEditMode(false);
    }
  }
  
  const handleIconChange = (selectedIcon) => {
    modifyData({type: 'modify', data: { iconName: selectedIcon } });
    setSelectIconOpen('');
  }

  const handleDelete = (index) => {
    modifyData({ type: 'delete' });

    if(props.onDelete) props.onDelete();
  }
  
  const Icon = getIcon(data.iconName);

  return (
    <Fragment>
      <Draggable draggableId={`dashboards-${data.id}`} index={index}>
        {(provided, snapshot) => (
          <Paper square={!snapshot.isDragging} elevation={snapshot.isDragging ? 2 : 0} {...provided.draggableProps} ref={provided.innerRef}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <div {...provided.dragHandleProps} >
                  <Icons.mdiReorderHorizontal />
                </div>
              </ListItemIcon>
              
              {!editMode ? 
                <ListItemText primary={data.label} /> :
                <TextField autoFocus className={classes.editTextField} type="text" value={tempLabel} onBlur={() => handelLabelChange({ key: 'Enter', target: { value: tempLabel } })} onChange={(e) => setTempLabel(e.target.value) } onKeyPress={handelLabelChange} />
              }

              <ListItemSecondaryAction>
                {children}

                <IconButton disabled={editMode} onClick={() => setEditMode(true)}>
                  <Icons.mdiPencil />
                </IconButton>

                <IconButton onClick={() => setSelectIconOpen(true)}>
                  <Icon />
                </IconButton>

                <IconButton onClick={() => handleDelete()}>
                  <Icons.mdiDelete color="secondary" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />
          </Paper>
        )}
      </Draggable>
      <IconSelectDialog open={selectIconOpen ? true : false} onApply={(selectedIcon) => handleIconChange(selectedIcon)} onClose={() => setSelectIconOpen(false)} />
    </Fragment>
  );
}

export default Settings;