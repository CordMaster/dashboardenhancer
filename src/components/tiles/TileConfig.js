import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration, Fab, AppBar, Tabs, Tab, DialogContent, Button, Grid } from '@material-ui/core';
import tileConfigDefinitions from './tileConfigDefinitions';
import useSettingsDefinition, { useSectionRenderer } from '../../definitions/useSettingsDefinition';
import { PreviewTile } from './Tile';
import tileMappings from './tileMappings';
import { MainContext } from '../../contexts/MainContextProvider';

const useStyles = makeStyles(theme => ({
  previewContainer: {
    boxSizing: 'border-box',

    padding: theme.spacing(2)
  }
}));

export default function({ tile, optionBuffer, setOptionBuffer }) {
  const classes = useStyles();

  const [currentTab, setCurrentTab] = useState(0);

  const generalSections = tileConfigDefinitions['general'];
  const typeSections = tileConfigDefinitions[tile.type];

  const allSections = { ...generalSections, ...typeSections };

  const [currentSectionName, currentSection] = Object.entries(allSections)[currentTab];

  const [tileOptions, setTileOptions] = useSettingsDefinition(allSections, optionBuffer, (newState) => {
    setOptionBuffer(newState);
  });

  const uiTabs = Object.values(allSections).map((section, index) => {
    return <Tab label={section.sectionLabel} />
  });

  return (
    <Fragment>
      <Paper square elevation={0}>
        <Tabs color="default" value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          {uiTabs}
        </Tabs>
      </Paper>

      <DialogContent>
        <TileConfigSection sectionName={currentSectionName} section={currentSection} tileOptions={tileOptions} setTileOptions={setTileOptions} />
      </DialogContent>

      <Grid container className={classes.previewContainer} justify="center">
        <Grid item xs={12}>
          <Typography gutterBottom variant="h5">Preview</Typography>
        </Grid>

        <PreviewTile Type={tileMappings[tile.type].Type} options={optionBuffer} w={250} h={150} />
      </Grid>
    </Fragment>
  );
}

function TileConfigSection({ sectionName, section, tileOptions, setTileOptions }) {
  const mainContext = useContext(MainContext);

  const [provided, handleSave, noShow] = useSectionRenderer(sectionName, section, tileOptions, setTileOptions, mainContext);

  return (
    <Fragment>
      {provided}
    </Fragment>
  );
}