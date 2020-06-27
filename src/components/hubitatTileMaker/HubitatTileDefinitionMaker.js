import React, { useState, Fragment } from 'react';
import { Grid, Typography, TextField, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Paper, DialogContent, makeStyles, Switch, FormControlLabel, Button } from '@material-ui/core';
import merge from 'deepmerge';

import { useModifyImmutableCollection } from '../../contexts/useCollection';

import { toSentence } from '../../Utils';
import { PreviewTile, BaseTile } from '../tiles/Tile';
import validHubitatTileDefinitionSectionTypes, { optionOverridesTemplates } from './validHubitatTileDefinitionSectionTypes';
import InputComponents from '../InputComponents';

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

  const tabs = [
    'primary',
    'secondary',
    'label'
  ]

  let uiTabs = tabs.map((name) => <Tab key={name} label={toSentence(name)} />);
  uiTabs.push(<Tab key="optionOverrides" label="Option Overrides" />);

  const mergeSection = (data) => setSectionsBuffer({ ...sectionsBuffer, [currentSectionName]: merge(currentSection, data, { arrayMerge: (oldArr, newArr) => newArr }) });

  return (
    <Fragment>
      <Paper square elevation={0}>
        <Tabs color="default" value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          {uiTabs}
        </Tabs>

        { currentSectionName !== 'optionOverrides' ?
          <SectionTab label={toSentence(currentSectionName)} section={currentSection} setSection={(data) => setSectionsBuffer({ ...sectionsBuffer, [currentSectionName]: data })} mergeSection={mergeSection} />
          :
          <OptionOverridesProperties optionOverrides={currentSection} mergeSection={mergeSection} />
        }
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
    const conditions = validHubitatTileDefinitionSectionTypes[type].reduce((sum, item) => {
      sum[item.name] = {
        type: 'none'
      };
      return sum;
    }, {});

    return conditions;
  }

  const handleTypeChange = e => {
    const value = e.target.value;

    //reset conditions too
    setSection({ enabled: section.enabled, type: value, ...generateConditions(value) });
  }

  const avaliableProperties = validHubitatTileDefinitionSectionTypes[section.type].map(propertyTemplate => {
    const propertyTemplateName = propertyTemplate.name;

    return [ section[propertyTemplateName], propertyTemplate, (value) => {
      mergeSection({ [propertyTemplateName]: value });
     }
    ];
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

      {section.enabled && section.type !== 'none' && <Properties properties={avaliableProperties} />}
    </DialogContent>
  );
}

function OptionOverridesProperties({ optionOverrides, mergeSection }) {
  const avaliableProperties = optionOverridesTemplates.map(propertyTemplate => {
    const propertyTemplateName = propertyTemplate.name;

    return [ optionOverrides[propertyTemplateName], propertyTemplate, (value) => {
      mergeSection({ [propertyTemplateName]: value });
     }
    ];
  });

  return (
    <DialogContent>
      <Properties properties={avaliableProperties} />
    </DialogContent>
  );
}

export function Properties({ properties }) {
  const classes = usePSStyles();

  const uiProperties = properties.map(([property, propertyTemplate, mergeProperty], index) => {
    const propertyName = propertyTemplate.name;
    
    const propertyType = property.type;
    const propertyValue = property.value;

    const handlePropertyTypeChange = e => {
      const value = e.target.value;

      let newValue;

      if(value !== 'none') {
        if(value === 'conditional') newValue = [];
        else newValue = propertyTemplate.default;
      } else newValue = null;
  
      mergeProperty({ type: value, value: newValue });
    }

    return (
      <Paper square key={propertyName} className={classes.typeContainer}>
        <Grid container>
          <Typography variant="h6" gutterBottom>{propertyName}</Typography>
          <FormControl fullWidth margin="dense">
            <InputLabel>Property Type</InputLabel>
            <Select value={propertyType} onChange={handlePropertyTypeChange}>
              <MenuItem value="none">Default</MenuItem>
              <MenuItem value="constant">Constant</MenuItem>
              <MenuItem value="conditional">Conditional</MenuItem>
            </Select>
        </FormControl>
        </Grid>
        { propertyType !== 'none' &&
          (propertyType === 'conditional' ? 
          <Conditions typeDefault={propertyTemplate.default} Component={InputComponents[propertyTemplate.type]} conditions={propertyValue} setConditions={(value) => mergeProperty({ value })} />
          :
          <Constant Component={InputComponents[propertyTemplate.type]} constant={propertyValue} setConstant={(value) => mergeProperty({ value })} />
          )
        }
      </Paper>
    );
  });

  return (
    <Fragment>
      {uiProperties}
    </Fragment>
  )
}

export function Constant({ Component, constant, setConstant }) {
  return (
    <Component value={constant} setValue={setConstant} />
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
        <ValueComponent value={condition.value} setValue={(value) => modifyCondition({ value })} />
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