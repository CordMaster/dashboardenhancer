import React, { useState, Fragment } from 'react';
import { Grid, Typography, TextField, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Paper, DialogContent, makeStyles, Switch, FormControlLabel, Button } from '@material-ui/core';
import merge from 'deepmerge';

import { useModifyImmutableCollection } from '../../contexts/useCollection';

import { toSentence } from '../../Utils';
import { PreviewTile, BaseTile } from '../tiles/Tile';
import validHubitatTileDefinitionProperties from './validHubitatTileDefinitionProperties';

const useStyles = makeStyles(theme => ({
  previewContainer: {
    boxSizing: 'border-box',

    padding: theme.spacing(2)
  }
}));

export default function({ sectionsBuffer, setSectionsBuffer }) {
  const classes = useStyles();

  const [currentTab, setCurrentTab] = useState(0);
  const [currentSectionName, currentSection] = Object.entries(sectionsBuffer)[currentTab];

  const primaryContent = <Typography variant="h4">Primary</Typography>
  const secondaryContent = <Typography variant="subtitle2" align="center">Secondary</Typography>

  const uiTabs = Object.entries(sectionsBuffer).map(([name, section]) => <Tab key={name} label={toSentence(name)} />);

  return (
    <Fragment>
      <Paper square elevation={0}>
        <Tabs color="default" value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          {uiTabs}
        </Tabs>

        <SectionTab label={toSentence(currentSectionName)} section={currentSection} setSection={(data) => setSectionsBuffer({ ...sectionsBuffer, [currentSectionName]: data })} mergeSection={(data) => setSectionsBuffer({ ...sectionsBuffer, [currentSectionName]: merge(currentSection, data, { arrayMerge: (oldArr, newArr) => newArr }) })} />
      </Paper>

      <Grid container className={classes.previewContainer} justify="center">
        <Grid item xs={12}>
          <Typography gutterBottom variant="h5">Preview</Typography>
        </Grid>

        <PreviewTile Type={BaseTile} primaryContent={sectionsBuffer.primary.enabled && primaryContent} secondaryContent={sectionsBuffer.secondary.enabled && secondaryContent} w={250} h={150} />
      </Grid>
    </Fragment>
  );
}

const usePSStyles = makeStyles(theme => ({
  typeContainer: {
    boxSizing: 'border-box',

    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

export function SectionTab({ label, section, setSection, mergeSection }) {
  const classes = usePSStyles();

  const generateConditions = type => {
    const conditions = validHubitatTileDefinitionProperties[type].reduce((sum, item) => {
      sum[item.name] = [];
      return sum;
    }, {});

    return conditions;
  }

  const handleTypeChange = e => {
    const value = e.target.value;

    //reset conditions too
    setSection({ enabled: section.enabled, type: value, ...generateConditions(value) });
  }

  const uiSections = validHubitatTileDefinitionProperties[section.type].map((property, index) => {
    const conditions = section[property.name];
    const isConstant = !Array.isArray(conditions);

    return (
      <Paper square key={property.name} className={classes.typeContainer}>
        <Grid container justify="space-between">
          <Typography variant="h6" gutterBottom>{property.name}</Typography>
          <FormControl>
            <FormControlLabel control={<Switch />} label={'Constant'} checked={isConstant} onChange={() => mergeSection({ [property.name]: !(isConstant) ? property.default : [] })} />
          </FormControl>
        </Grid>
        { !isConstant ? 
          <Conditions typeDefault={property.default} Component={property.Component} conditions={conditions} setConditions={(conditions) => mergeSection({ [property.name]: conditions })} />
          :
          <Constant Component={property.Component} constant={conditions} setConstant={(constant) => mergeSection({ [property.name]: constant })} />
        }
      </Paper>
    );
  });

  return (
    <DialogContent>
       <Typography variant="subtitle2" gutterBottom>Note: you can substitute %deviceName% to get the device name and %[attributeName]% to get an attribute's value</Typography>

      <FormControl fullWidth>
        <FormControlLabel control={<Switch />} label={`${label} enabled`} checked={section.enabled} onChange={() => setSection({ enabled: !section.enabled, type: 'none' })} />
      </FormControl>

      { section.enabled &&
        <FormControl fullWidth margin="dense">
          <InputLabel>Type</InputLabel>
          <Select value={section.type} onChange={handleTypeChange}>
            <MenuItem value="none">Not set</MenuItem>
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="icon">Icon</MenuItem>
          </Select>
        </FormControl>
      }

      {section.enabled && section.type !== 'none' && uiSections}
    </DialogContent>
  );
}

export function Constant({ Component, constant, setConstant }) {
  return (
    <Component value={constant} onChange={(e) => setConstant(e.target ? e.target.value : e)} />
  )
}

export function Conditions({ typeDefault, Component, conditions, setConditions }) {
  const modifyConditions = useModifyImmutableCollection(conditions, {
    attributeName: '',
    comparator: '===',
    requiredState: '',
    value: typeDefault
  }, (state) => {
    setConditions(state);
  });
  
  const uiConditions = conditions.map((condition, index) => {
    return (
      <Condition key={index} ValueComponent={Component} condition={condition} modifyCondition={(data) => modifyConditions({ type: 'modify', index, data }) } />
    );
  });

  return (
    <Fragment>
      <Button variant="contained" color="primary" onClick={() => modifyConditions({ type: 'new' })}>Add condition</Button>
      {uiConditions}
    </Fragment>
  );
}

export function Condition({ ValueComponent, condition, modifyCondition }) {


  return (
    <Grid container alignItems="flex-end" spacing={2}>
      <Grid item xs={2}>
        <ValueComponent value={condition.value} onChange={(e) => modifyCondition({ value: e.target ? e.target.value : e })} />
      </Grid>

      <Grid item xs={2}>
        <Typography variant="subtitle2" align="center">when</Typography>
      </Grid>
      
      <Grid item xs={2}>
        <TextField fullWidth label="Attr name" value={condition.attributeName} onChange={(e) => modifyCondition({ attributeName: e.target.value })} />
      </Grid>

      <Grid item xs={1}>
        <Typography variant="subtitle2" align="center">is</Typography>
      </Grid>

      <Grid item xs={2}>
        <FormControl fullWidth>
          <InputLabel>Condition</InputLabel>
          <Select value={condition.comparator} onChange={(e) => modifyCondition({ comparator: e.target.value })}>
            <MenuItem value="===">equal to</MenuItem>
            <MenuItem value="!==">not equal to</MenuItem>
            <MenuItem value="<">less than</MenuItem>
            <MenuItem value=">">greater than</MenuItem>
            <MenuItem value="<=">less than or equal to</MenuItem>
            <MenuItem value=">=">greater than or equal to</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={3}>
        <TextField fullWidth label="Value" value={condition.requiredState} onChange={(e) => modifyCondition({ requiredState: e.target.value })}/>
      </Grid>
    </Grid>
  );
}