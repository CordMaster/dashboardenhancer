import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration, Fab, AppBar, Tabs, Tab, DialogContent } from '@material-ui/core';
import tileConfigDefinitions from '../Tile/tileConfigDefinitions';
import useSettingsDefinition, { useSectionRenderer } from '../definitions/useSettingsDefinition';

export default function({ tile, modifyTile }) {
  const [currentTab, setCurrentTab] = useState(0);

  const generalSections = tileConfigDefinitions['all'];
  const typeSections = tileConfigDefinitions[tile.type];

  const allSections = { ...generalSections, ...typeSections };

  const [optionBuffer, setOptionBuffer] = useState(tile.options);

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
        <TileConfigSection section={Object.values(allSections)[currentTab]} tileOptions={tileOptions} setTileOptions={setTileOptions} />
      </DialogContent>
    </Fragment>
  );
}

function TileConfigSection({ section, tileOptions, setTileOptions }) {
  const [provided, handleSave, noShow] = useSectionRenderer(section, tileOptions, setTileOptions);

  return (
    <Fragment>
      {provided}
    </Fragment>
  );
}