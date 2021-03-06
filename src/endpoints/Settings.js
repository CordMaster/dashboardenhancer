import React, { useState, useEffect, useContext, Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';

import { makeStyles, CircularProgress, Snackbar, SnackbarContent, Select, DialogContent, Tabs } from '@material-ui/core';

import { Grid, Paper, Typography, TextField, MenuItem, Button, Switch, FormControlLabel, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, FormControl, FormLabel, RadioGroup, Radio, ThemeProvider } from '@material-ui/core';

import { Alert, ToggleButton } from '@material-ui/lab';

import Icons, { getIcon } from '../Icons';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MainContext } from '../contexts/MainContextProvider';

import IconSelectDialog from '../components/IconSelectDialog.js';
import settingsDefinitons from '../definitions/settingsDefinitons';
import { useSectionRenderer } from '../definitions/useSettingsDefinition';
import useConfigDialog from '../components/useConfigDialog';
import defaultHubitatTileDefinitions from '../components/hubitatTileMaker/defaultHubitatTileDefinitions';
import HubitatTileDefinitionMaker from '../components/hubitatTileMaker/HubitatTileDefinitionMaker';
import { PopoverColorPicker } from '../components/colorpicker/ColorPicker';
import DashboardConfig from '../components/DashboardConfig';

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

          <HubitatTileDefinitionsSettings />

          {compiledSettings}

          <SettingsSection title="Legal">
            <Button variant="outlined" color="secondary" onClick={() => window.location.href = "/local/attribution.txt"}>Licenses</Button>
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

  const [children, handleSave, noShow] = useSectionRenderer(sectionName, section, config, setConfig, state);

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
  const defaultDashboard = config.other.defaultDashboard;
  const setDefaultDashboard = setConfig.other.defaultDashboard;

  const [newText, setNewText] = useState('');

  const [providedDialog, setDialogOpenOn] = useConfigDialog((index) => `Edit ${dashboards[index].label}`, (index) => {
    return <DashboardConfig dashboard={dashboards[index]} modifyDashboard={(data) => modifyDashboards({ type: 'modify', index, data })} />;
  }, () => null);

  const handleAdd = () => {
    modifyDashboards({ type: 'new', data: { label: newText } });

    if(defaultDashboard === -1) setDefaultDashboard(0);

    setNewText('');
  }

  const handleEnd = result => {
    const {source, destination} = result;
    
    if(source.droppableId === destination.droppableId) {
      modifyDashboards({ type: 'move', srcIndex: source.index, destIndex: destination.index });

      //update the default too
      if(defaultDashboard === source.index) setDefaultDashboard(destination.index);
      else if(defaultDashboard === destination.index) setDefaultDashboard(source.index)
    }
  }

  const uiDashboards = dashboards.map((dashboard, index) => {
    const handleEdit = () => {
      setDialogOpenOn(index);
    }

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
        <IconButton onClick={() => handleEdit()}>
          <Icons.mdiPencil />
        </IconButton>
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

          {providedDialog}
        </SettingsSection>
    </DragDropContext>
  );
}

function HubitatTileDefinitionsSettings() {
  const classes = usePSStyles();

  const { hubitatTileDefinitions, modifyHubitatTileDefinitions } = useContext(MainContext);

  const [newText, setNewText] = useState('');

  const [sectionsBuffer, setSectionsBuffer] = useState({});

  const [providedDialog, setDialogOpenOn] = useConfigDialog('Edit Tile Definition', (index) => {
    return <HubitatTileDefinitionMaker sectionsBuffer={sectionsBuffer} setSectionsBuffer={setSectionsBuffer} />
  }, (index) => {
    modifyHubitatTileDefinitions({ type: 'modify', index, data: { sections: sectionsBuffer } });
  }, "xl");

  const handleAdd = () => {
    modifyHubitatTileDefinitions({ type: 'new', data: { label: newText } });

    setNewText('');
  }

  const handleEnd = result => {
    const {source, destination} = result;
    
    if(source.droppableId === destination.droppableId) {
      modifyHubitatTileDefinitions({ type: 'move', srcIndex: source.index, destIndex: destination.index });
    }
  }

  const uiDefaultTileDefinitions = defaultHubitatTileDefinitions.map((tileDefinition, index) => {
    const Icon = getIcon(tileDefinition.iconName);

    return (
      <Fragment>
        <ListItem key={tileDefinition.id}>
          <ListItemIcon>
            <Icon />
          </ListItemIcon>

          <ListItemText>
            {tileDefinition.label}
          </ListItemText>

          <ListItemSecondaryAction>
            <Typography variant="subtitle2" color="secondary">
              Default Tile Type
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
      </Fragment>
    );
  });

  const uiTileDefinitions = hubitatTileDefinitions.map((tileDefinition, index) => {
    const handleEdit = () => {
      setSectionsBuffer(hubitatTileDefinitions[index].sections);
      setDialogOpenOn(index);
    }

    return (
      <DraggableListItem key={tileDefinition.id} index={index} data={tileDefinition} modifyData={(action) => modifyHubitatTileDefinitions(Object.assign({ index, ...action }))}>
        <IconButton onClick={() => handleEdit()}>
          <Icons.mdiPencil />
        </IconButton>
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
                  <List>
                    <Divider />

                    {uiDefaultTileDefinitions}
                    {uiTileDefinitions}

                    {provided.placeholder}
                  </List>
                </div>
              )}
            </Droppable>
          </div>

          {providedDialog}
        </SettingsSection>
    </DragDropContext>
  );
}

const useLItems = makeStyles(theme => ({
  listItem: {
    padding: theme.spacing(2)
  }
}));

function DraggableListItem({ index, data, modifyData, viewOnly, children, ...props }) {
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
              <ListItemIcon>
                <div {...provided.dragHandleProps} >
                  <Icons.mdiReorderHorizontal />
                </div>
              </ListItemIcon>
              
              {!editMode ? 
                <ListItemText primary={data.label} /> :
                <TextField autoFocus type="text" value={tempLabel} onBlur={() => handelLabelChange({ key: 'Enter', target: { value: tempLabel } })} onChange={(e) => setTempLabel(e.target.value) } onKeyPress={handelLabelChange} />
              }

              { !viewOnly &&
                <ListItemSecondaryAction>
                  <IconButton disabled={editMode} onClick={() => setEditMode(true)}>
                    <Icons.mdiCursorText />
                  </IconButton>

                  {children}

                  <IconButton onClick={() => setSelectIconOpen(true)}>
                    <Icon />
                  </IconButton>

                  <IconButton onClick={() => handleDelete()}>
                    <Icons.mdiDelete color="secondary" />
                  </IconButton>
                </ListItemSecondaryAction>
              }
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