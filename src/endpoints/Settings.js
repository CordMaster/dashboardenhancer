import React, { useState, useEffect, useContext, Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';

import { makeStyles, CircularProgress, Snackbar, SnackbarContent, Select } from '@material-ui/core';

import { Grid, Paper, Typography, TextField, MenuItem, Button, Switch, FormControlLabel, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, FormControl, FormLabel, RadioGroup, Radio, ThemeProvider } from '@material-ui/core';

import { Alert, ToggleButton } from '@material-ui/lab';

import * as Icons from '@material-ui/icons';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MainContext, settings } from '../contexts/MainContextProvider';

import IconSelectDialog from '../components/IconSelectDialog.js';
import ColorPicker from '../components/colorpicker/ColorPicker';
import DevicePicker from '../components/DevicePicker';
import { HubContext } from '../contexts/HubContextProvider';

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
  const { theme, setTheme, config, setConfig, iconsOnly, setIconsOnly, title, setTitle, showBadges, setShowBadges, overrideColors, setOverrideColors, showClock, setShowClock, clockOnTop, setClockOnTop, showClockAttributes, setShowClockAttributes, lockSettings, setLockSettings, lockFully, setLockFully, save } = useContext(MainContext);

  const [snackbarContent, setSnackbarContent] = useState({ value: '', type: '' });

  const handleSave = () => {
    save().done(() => {
      setSnackbarContent({ value: "Successfully saved settings!", type: 'success' });
    }).fail(() => {
      setSnackbarContent({ value: "There was an error saving your settings.", type: 'error' });
    });
  }

  const compiledSettings = useMemo(() => { 
    return settings.map((section) => {
      if(!section.noShow) {
        const children = section.sectionOptions.map((setting) => {
          let Type;

          switch(setting.type){
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

          return <Type key={setting.name} label={setting.label} value={config[setting.name]} setValue={setConfig[setting.name]} />;
        });

        return (
          <SettingsSection key={section.sectionName} title={section.sectionLabel} button={section.saveBuffer} buttonLabel="Apply" onButtonClick={() => null}>
            {children}
          </SettingsSection>
        );
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
          
          {allDashboards.length > 0 ? 
            <DashboardsSettings allDashboards={allDashboards} /> :
            <SettingsSection title="Dashboards Loading">
              <CircularProgress />
            </SettingsSection>
          }

          {compiledSettings}

          {/*<SettingsSection title="Title">
            <FormControl fullWidth margin="dense">
              <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>
          </SettingsSection>

          <SettingsSection title="Lock Settings">
            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Disable settings when locked" checked={lockSettings} onChange={() => setLockSettings(!lockSettings)} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Fully disable viewing dashboards when locked" checked={lockFully} onChange={() => setLockFully(!lockFully)} />
            </FormControl>
          </SettingsSection>

          <SettingsSection title="Drawer Settings">
            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Icons only" checked={iconsOnly} onChange={() => setIconsOnly(!iconsOnly) & setShowClock(false) & setShowClockAttributes(false)} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Show badges" checked={showBadges} onChange={() => setShowBadges(!showBadges)} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Show clock" disabled={iconsOnly} checked={showClock} onChange={() => setShowClock(!showClock)} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Show clock on top" disabled={iconsOnly} checked={clockOnTop} onChange={() => setClockOnTop(!clockOnTop)} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Show attributes under clock" disabled={iconsOnly} checked={showClockAttributes} onChange={() => setShowClockAttributes(!showClockAttributes)} />
            </FormControl>

            { showClockAttributes && <ClockAttrSettings /> }
          </SettingsSection>

          <FontSizeSettings />

          <SettingsSection title="Color Settings">
            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label={`${overrideColors ? 'Dark base' : 'Dark theme'}`} checked={theme === 'dark'} onChange={() => theme === 'dark' ? setTheme('light') : setTheme('dark')} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormControlLabel control={<Switch />} label="Override colors" checked={overrideColors} onChange={() => setOverrideColors(!overrideColors)} />
            </FormControl>
          </SettingsSection>

        {overrideColors && <ColorOverrideSettings />}*/}

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

const SettingsSection = React.memo(({ title, button, buttonLabel, onButtonClick, children }) => {
  const classes = useSectionStyles();

  return (
    <Paper className={classes.paper}>
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

const DerrivedSettingsSection = React.memo(({  }) => {
  const cachedValues = useState({});

  return (
    null
  );
});

const BooleanType = React.memo(({label, value, setValue}) => {
  return (
    <FormControl fullWidth margin="dense">
      <FormControlLabel control={<Switch />} label={label} checked={value} onChange={() => setValue(!value)} />
    </FormControl>
  );
});

const TextType = React.memo(({label, value, setValue}) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField label={label} value={value} onChange={(e) => setValue(e.target.value)} />
    </FormControl>
  );
});

const NumberType = React.memo(({label, value, setValue}) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField type="number" label={label} value={value} onChange={(e) => setValue(e.target.value)} />
    </FormControl>
  );
});

const ColorType = React.memo(({ label, value, setValue }) => {
  return (
    <Fragment>
      <Typography variant="subtitle1">Background Color</Typography>
      <ColorPicker value={value} onChange={(value) => setValue(value)} />
    </Fragment>
  );
});

const DeviceAttributeType = React.memo(({ value, setValue }) => {
  return <DevicePicker value={value} onChange={(value) => setValue(value)} />
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

function ClockAttrSettings() {
  const { clockAttr1, setClockAttr1, clockAttr2, setClockAttr2, clockAttr1Label, setClockAttr1Label, clockAttr2Label, setClockAttr2Label, devices } = useContext(MainContext);

  let deviceItems = [];

  Object.entries(devices).forEach(([id, device]) => {
    deviceItems.push(<MenuItem key={id} value={id}>{device.label}</MenuItem>)
  });

  return (
    <Fragment>
      <FormControl fullWidth margin="dense">
        <TextField label="1st Attribute Label" value={clockAttr1Label} onChange={(e) => setClockAttr1Label(e.target.value)} />
      </FormControl>

      <DevicePicker value={clockAttr1} onChange={(value) => setClockAttr1(value)} />

      <FormControl fullWidth margin="dense">
        <TextField label="2nd Attribute Label" value={clockAttr2Label} onChange={(e) => setClockAttr2Label(e.target.value)} />
      </FormControl>

      <DevicePicker value={clockAttr2} onChange={(value) => setClockAttr2(value)} />
  </Fragment>
  );
}

function FontSizeSettings() {
  const {fontSize, setFontSize} = useContext(MainContext);

  const [tempFontSize, setTempFontSize] = useState(fontSize);
  
  const handleApply = () => {
    setFontSize(Math.min(Math.max(10, tempFontSize), 100));
  }

  return (
    <SettingsSection title="Font Size" button buttonLabel="Apply" onButtonClick={handleApply}>
      <FormControl fullWidth margin="dense">
        <TextField label="Size" type="number" value={tempFontSize} onChange={(e) => setTempFontSize(parseInt(e.target.value))} />
      </FormControl>
    </SettingsSection>
  );
}

function ColorOverrideSettings() {
  const {overrideBG, setOverrideBG, overrideFG, setOverrideFG, overridePrimary, setOverridePrimary, overrideSecondary, setOverrideSecondary} = useContext(MainContext);

  const [tempBG, setTempBG] = useState(overrideBG);
  const [tempFG, setTempFG] = useState(overrideFG);
  const [tempPrimary, setTempPrimary] = useState(overridePrimary);
  const [tempSecondary, setTempSecondary] = useState(overrideSecondary);

  const handleApply = () => {
    setOverrideBG(tempBG);
    setOverrideFG(tempFG);
    setOverridePrimary(tempPrimary);
    setOverrideSecondary(tempSecondary);
  }

  return (
    <SettingsSection title="Color Overrides" button buttonLabel="Apply" onButtonClick={handleApply}>
      <Typography variant="subtitle1">Background Color</Typography>
      <ColorPicker value={tempBG} onChange={(value) => setTempBG(value)} />

      <Typography variant="subtitle1">Text Color</Typography>
      <ColorPicker value={tempFG} onChange={(value) => setTempFG(value)} />

      <Typography variant="subtitle1">Primary Color</Typography>
      <ColorPicker value={tempPrimary} onChange={(value) => setTempPrimary(value)} />

      <Typography variant="subtitle1">Secondary Color</Typography>
      <ColorPicker value={tempSecondary} onChange={(value) => setTempSecondary(value)} />
    </SettingsSection>
  );
}

function DashboardsSettings({ allDashboards }) {
  const classes = usePSStyles();

  const { dashboards, modifyDashboards, defaultDashboard, setDefaultDashboard } = useContext(MainContext);

  const disabledDashboards = allDashboards.filter((val) => dashboards.findIndex((val2) => val2.id === val.id) === -1);

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
        modifyDashboards({ type: 'new', index: destination.index, data: { id: disabledDashboards[source.index].id } });

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
  
  const Icon = Icons[dashboard.iconName];

  return (
    <Fragment>
      <Draggable draggableId={`dashboards-${dashboard.id}`} index={index}>
        {(provided, snapshot) => (
          <Paper square={!snapshot.isDragging} elevation={snapshot.isDragging ? 2 : 0} {...provided.draggableProps} ref={provided.innerRef}>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <div {...provided.dragHandleProps} >
                  <Icons.Reorder  />
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
                  <Icons.Edit />
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
                  <Icons.Reorder  />
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