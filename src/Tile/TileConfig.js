import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration, Fab, AppBar, Tabs, Tab, DialogContent, Button } from '@material-ui/core';
import tileConfigDefinitions from '../Tile/tileConfigDefinitions';
import useSettingsDefinition, { useSectionRenderer } from '../definitions/useSettingsDefinition';

export default function({ tile, modifyTile, optionBuffer, setOptionBuffer }) {
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
    </Fragment>
  );
}

function TileConfigSection({ sectionName, section, tileOptions, setTileOptions }) {
  const [provided, handleSave, noShow] = useSectionRenderer(sectionName, section, tileOptions, setTileOptions);

  return (
    <Fragment>
      {provided}
    </Fragment>
  );
}