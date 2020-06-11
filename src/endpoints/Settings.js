import React, { useState, useEffect, useContext, Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';

import { makeStyles, CircularProgress, Snackbar, SnackbarContent, Select } from '@material-ui/core';

import { Grid, Paper, Typography, TextField, MenuItem, Button, Switch, FormControlLabel, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, FormControl, FormLabel, RadioGroup, Radio, ThemeProvider } from '@material-ui/core';

import { Alert, ToggleButton } from '@material-ui/lab';

import Icons, { getIcon } from '../Icons';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MainContext, settings } from '../contexts/MainContextProvider';

import IconSelectDialog from '../components/IconSelectDialog.js';
import ColorPicker from '../components/colorpicker/ColorPicker.js';
import DevicePicker from '../components/devicepicker/DevicePicker.js';
import { HubContext } from '../contexts/HubContextProvider.js';

const useStyles = makeStyles(theme => ({
  settingsPaper: {
    paddingTop: theme.spacing(2),
    minHeight: '100%'
  },

  saveBtn: {
    float: 'right'
  }
}));

function Settings() {
  const classes = useStyles();

  const { allDashboards } = useContext(HubContext);
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
    return Object.entries(settings).map(([sectionName, section]) => {
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
          <Typography variant="h5" gutterBottom>
            Settings
            <Button variant="contained" color="primary" onClick={handleSave} className={classes.saveBtn}>Save</Button>
          </Typography>
          
          <DashboardsSettings allDashboards={allDashboards} />

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

  const [cachedValues, setCachedValues] = useState(() => {
    return section.sectionOptions.reduce((sum, it) => {
      sum[it.name] = config[it.name];
      return sum;
    }, {});
  });

  const evaluateDependsOn = dependsOn => {
    if(dependsOn) {
      for(let i = 0; i < dependsOn.length; i++) {
        const dependency = dependsOn[i];
        if(typeof(dependency.name) === 'function') {
          if(dependency.name(state) !== dependency.value) return true;
        }
        else if(dependency.name && config[dependency.name] !== dependency.value) return true;
      }
    }
    return false;
  }

  const handleChange = (name, value) => {
    if(section.saveBuffer) {
      setCachedValues({ ...cachedValues, [name]: value });
    } else {
      setConfig[name](value);
    }
  }

  const children = section.sectionOptions.map((setting) => {
    let Type;

    switch(setting.type) {
      case 'text':
        Type = TextType;
        break;
      case 'number':
        Type = NumberType;
        break;
      case 'boolean':
        Type = BooleanType;
        break;
      case 'color':
        Type = ColorType;
        break;
      case 'deviceattribute':
        Type = DeviceAttributeType;
        break;
      default:
        Type = Typography;
        break;
    }

    const evaluatedDepends = evaluateDependsOn(setting.dependsOn);
    const disabled = evaluatedDepends && setting.disableOnDepends;
    const hidden = evaluatedDepends && !setting.disableOnDepends;
    return !hidden && <Type key={setting.name} label={setting.label} value={section.saveBuffer ? cachedValues[setting.name] : config[setting.name]} disabled={disabled} setValue={value => handleChange(setting.name, value)} />;
  });

  const handleSave = () => {
    section.sectionOptions.forEach(it => {
      setConfig[it.name](cachedValues[it.name]);
    });
  }

  const noShow = evaluateDependsOn(section.dependsOn);

  return (
    <SettingsSection className={noShow && classes.noDisplay} key={sectionName} title={section.sectionLabel} button={section.saveBuffer} buttonLabel="Apply" onButtonClick={handleSave}>
      {children}
    </SettingsSection>
  );
});

const BooleanType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <FormControlLabel control={<Switch />} label={label} checked={value} onChange={() => setValue(!value)} {...props} />
    </FormControl>
  );
});

const TextType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField label={label} value={value} onChange={(e) => setValue(e.target.value)} {...props} />
    </FormControl>
  );
});

const NumberType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField type="number" label={label} value={value} onChange={(e) => setValue(parseFloat(e.target.value))} {...props} />
    </FormControl>
  );
});

const ColorType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <Fragment>
      <Typography variant="subtitle1">{label}</Typography>
      <ColorPicker value={value} onChange={(value) => setValue(value)} {...props} />
    </Fragment>
  );
});

const DeviceAttributeType = React.memo(({ value, setValue, ...props }) => {
  return <DevicePicker value={value} onChange={(value) => setValue(value)} {...props} />
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

function DashboardsSettings({ allDashboards }) {
  const classes = usePSStyles();

  const { dashboards, modifyDashboards, config, setConfig } = useContext(MainContext);
  const { ensureLayoutLoaded } = useContext(HubContext);
  const defaultDashboard = config.defaultDashboard;
  const setDefaultDashboard = setConfig.defaultDashboard;
  
  const disabledDashboards = Object.values(allDashboards).filter((val) => dashboards.findIndex((val2) => val2.id === val.id) === -1);

  const handleEnd = (result) => {
    const {source, destination} = result;
    
    if(source.droppableId === destination.droppableId && source.droppableId === "dashboards-enabled") {
      modifyDashboards({ type: 'move', startIndex: source.index, destIndex: destination.index });

      //update the default too
      if(defaultDashboard === source.index) setDefaultDashboard(destination.index);
      else if(defaultDashboard === destination.index) setDefaultDashboard(source.index)
    }
    else if(source.droppableId !== destination.droppableId) {
      if(destination.droppableId === "dashboards-disabled") {
        modifyDashboards({ type: 'delete', index: source.index });

        //update the default too
        if(defaultDashboard === source.index) {
          if(dashboards.length > 1) setDefaultDashboard(0);
          else setDefaultDashboard(-1);
        }
      }
      else if(destination.droppableId === "dashboards-enabled") {
        const newDashboard = Object.values(disabledDashboards)[source.index];
        modifyDashboards({ type: 'new', index: destination.index, data: { id: newDashboard.id, label: newDashboard.label } });
        ensureLayoutLoaded(newDashboard.id);

        //update the default too
        if(defaultDashboard === -1) setDefaultDashboard(0);
      }
    }
  }

  const uiEnabledDashboards = dashboards.map((dashboard, index) => {
    return (
      <DashboardListItem key={dashboard.id} dashboard={dashboard} modifyDashboard={(action) => modifyDashboards(Object.assign({ index, ...action }))} index={index} defaultDashboard={defaultDashboard} setDefaultDashboard={setDefaultDashboard} canDelete={dashboards.length > 1} />
    );
  });

  const uiDisabledDashboards = disabledDashboards.map((dashboardInfo, index) => {
    return (
      <DisabledDashboardListItem key={dashboardInfo.id} dashboardInfo={dashboardInfo} index={index} />
    );
  });

  return (
    <DragDropContext onDragEnd={handleEnd}>
      <SettingsSection title="Enabled Dashboards">
          <div className={classes.listContainer}>
            <Droppable droppableId="dashboards-enabled">
              {(provided, snapshot) => (
                <div className={classes.dropArea} ref={provided.innerRef}>
                  {uiEnabledDashboards.length > 0 ?
                    <List>
                      <Divider />

                      {uiEnabledDashboards}

                      {provided.placeholder}
                    </List> :
                    <Typography align="center" className={classes.helperText}>Drag a dashboard here</Typography>
                  }
                </div>
              )}
            </Droppable>
          </div>
        </SettingsSection>
        
        <SettingsSection title="Disabled Dashboards">
          <div className={classes.listContainer}>
            <Droppable droppableId="dashboards-disabled">
              {(provided, snapshot) => (
                <div className={classes.dropArea} ref={provided.innerRef}>
                  {uiDisabledDashboards.length > 0 ?
                    <List>
                      <Divider />

                      {uiDisabledDashboards}

                      {provided.placeholder}
                    </List> :
                    <Typography align="center" className={classes.helperText}>No dashboards found</Typography>
                  }
                </div>
              )}
            </Droppable>
          </div>
        </SettingsSection>
    
    </DragDropContext>
  );
}

const usePLItems = makeStyles(theme => ({
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

function DashboardListItem({ dashboard, modifyDashboard, index, defaultDashboard, setDefaultDashboard }) {
  const classes = usePLItems();

  const [editMode, setEditMode] = useState(false);
  const [tempLabel, setTempLabel] = useState(dashboard.label);
  const [selectIconOpen, setSelectIconOpen] = useState(false);
  

  const handelLabelChange = (e) => {
    const value = e.target.value;
    if(e.key === 'Enter') {
      modifyDashboard({ type: 'modify', data: { label: value } });
      setEditMode(false);
    }
  }
  
  const handleIconChange = (selectedIcon) => {
    modifyDashboard({type: 'modify', data: { iconName: selectedIcon } });
    setSelectIconOpen('');
  }

  const handleToggleLock = () => {
    modifyDashboard({type: 'modify', data: { lock: !dashboard.lock } });
  }
  
  const Icon = getIcon(dashboard.iconName);

  return (
    <Fragment>
      <Draggable draggableId={`dashboards-${dashboard.id}`} index={index}>
        {(provided, snapshot) => (
          <Paper square={!snapshot.isDragging} elevation={snapshot.isDragging ? 2 : 0} {...provided.draggableProps} ref={provided.innerRef}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <div {...provided.dragHandleProps} >
                  <Icons.mdiReorderHorizontal />
                </div>
              </ListItemIcon>
              
              {!editMode ? 
                <ListItemText primary={dashboard.label} /> :
                <TextField autoFocus className={classes.editTextField} type="text" value={tempLabel} onBlur={() => handelLabelChange({ key: 'Enter', target: { value: tempLabel } })} onChange={(e) => setTempLabel(e.target.value) } onKeyPress={handelLabelChange} />
              }

              <ListItemSecondaryAction>
                <Switch checked={defaultDashboard === index} onChange={() => setDefaultDashboard(index)} />

                <ToggleButton size="small" selected={dashboard.lock} onChange={() => handleToggleLock()}>Child Lock</ToggleButton>

                <IconButton disabled={editMode} onClick={() => setEditMode(true)}>
                  <Icons.mdiPencil />
                </IconButton>

                <IconButton onClick={() => setSelectIconOpen(true)}>
                  <Icon />
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

function DisabledDashboardListItem({ dashboardInfo, index }) {
  const classes = usePLItems();

  return (
    <Fragment>
      <Draggable draggableId={`dashboards-${dashboardInfo.id}`} index={index}>
        {(provided, snapshot) => (
          <Paper square={!snapshot.isDragging} elevation={snapshot.isDragging ? 2 : 0} {...provided.draggableProps} ref={provided.innerRef}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <div {...provided.dragHandleProps} >
                  <Icons.mdiReorderHorizontal />
                </div>
              </ListItemIcon>
              <ListItemText primary={dashboardInfo.label} />
            </ListItem>

            <Divider />
          </Paper>
        )}
      </Draggable>
    </Fragment>
  );
}

export default Settings;