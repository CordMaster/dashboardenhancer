import React, { useState, Fragment, useContext } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import Color from 'color';

import { BaseTile } from './Tile';
import { multipleClasses, evalExpr } from '../../Utils';
import { MainContext } from '../../contexts/MainContextProvider';
import defaultHubitatTileDefinitions from '../hubitatTileMaker/defaultHubitatTileDefinitions';
import { HubContext } from '../../contexts/HubContextProvider';

import Icons from '../../Icons';
import validHubitatTileDefinitionSectionTypes from '../hubitatTileMaker/validHubitatTileDefinitionSectionTypes';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorTile from './ErrorTile';

const useStyles = makeStyles(theme => ({
  iframe: {
    width: '100%',
    height: '100%',

    border: 'none',

    '&.noclick': {
      pointerEvents: 'none',
      touchAction: 'none'
    }
  }
}));

export default React.forwardRef(({ options, ...props }, ref) => {
  const classes = useStyles();

  const { devices, sendCommand } = useContext(HubContext);
  const { allHubitatTileDefinitions } = useContext(MainContext);

  if(options.deviceInfo.device && options.deviceInfo.type) {
    const device = devices[options.deviceInfo.device];
    const tileDefinition = allHubitatTileDefinitions.find(it => it.id === options.deviceInfo.type);
    const sections = tileDefinition.sections;

    const evalConditions = property => {
      const type = property.type;
      const value = property.value;

      const prepare = obj => {
        if(typeof(obj) !== 'string') return obj;

        let ret = obj;

        Object.entries(device.attributes).forEach(([attributeName, attribute]) => {
          ret = ret.replace(`%${attributeName}%`, attribute.currentState);
        });

        return ret.replace('%deviceName%', device.label);
      }

      if(type === 'constant') return prepare(value);
      else if(type === 'conditional') {
        let ret = '';

        value.forEach(condition => {
          const attribute = device.attributes[condition.attributeName];

          //TODO: break?
          if(attribute && evalExpr(attribute.currentState, condition.comparator, condition.requiredState)) ret = condition.value;
        });

        return prepare(ret);
      } else {
        return null;
      }
    }

    const getRenderer = section => {
      let options = {};
      Object.entries(validHubitatTileDefinitionSectionTypes[section.type].properties).forEach(([propertyName, property]) => {
        options[propertyName] = section[propertyName].type !== 'none' ? evalConditions(section[propertyName]) : property.default;
      });

      const Renderer = validHubitatTileDefinitionSectionTypes[section.type].Renderer;

      return <Renderer options={options} />;
    }

    let content = {};

    Object.entries(sections).forEach(([sectionName, section]) => {
      if(sectionName !== 'optionOverrides' && section.enabled) content[sectionName] = getRenderer(section);
    });

    //merge options
    let newOptions = { ...options };
    Object.entries(sections.optionOverrides).forEach(([key, override]) => {
      const path = key.split('.');
      if(override.type !== 'none' && path[0] && path[1]) newOptions[path[0]][path[1]] = evalConditions(override);
    });

    const handleClick = () => {
      if(device.attributes.switch) {
        if(device.attributes.switch.currentState === 'on') sendCommand(device.id, 'off');
        else sendCommand(device.id, 'on');
      }
    }

    //todo: unique title
    return (
      <ErrorBoundary fallbackRender={() => <ErrorTile ref={ref} options={newOptions} {...props} />}>
        <BaseTile ref={ref} options={newOptions} {...props} content={content} onClick={handleClick} />
      </ErrorBoundary>
    );
  }

  return <BaseTile ref={ref} options={options} {...props} content={{ }} />
});

