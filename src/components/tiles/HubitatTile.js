import React, { useState, Fragment, useContext } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import Color from 'color';

import { BaseTile } from './Tile';
import { multipleClasses, evalExpr } from '../../Utils';
import { MainContext } from '../../contexts/MainContextProvider';
import defaultHubitatTileDefinitions from '../hubitatTileMaker/defaultHubitatTileDefinitions';
import { HubContext } from '../../contexts/HubContextProvider';

import Icons from '../../Icons';

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

  const { devices } = useContext(HubContext);
  const { allHubitatTileDefinitions } = useContext(MainContext);

  if(options.deviceInfo.device && options.deviceInfo.type) {
    const device = devices[options.deviceInfo.device];
    const tileDefinition = allHubitatTileDefinitions.find(it => it.id === options.deviceInfo.type);
    const sections = tileDefinition.sections;

    const evalConditions = property => {
      console.log(property);
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
        let ret;

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

    const getRenderer = sectionName => {
      const section = sections[sectionName];

      switch(section.type) {
        case 'icon':
          var iconName = evalConditions(section.iconName);
          var color = evalConditions(section.color);
          var size = evalConditions(section.size);

          var Icon = iconName ? Icons[iconName] : Icons.mdiAlertCircle;
          var style = { color: color ? Color(color).rgb().string() : null, fontSize: size ? size : null };

          return (
            <Icon style={style} />
          );
        case 'text':
          var text = evalConditions(section.value);
          var color = evalConditions(section.color);
          var size = evalConditions(section.size);

          var style = { color: color ? Color(color).rgb().string() : null, fontSize: size ? size : null };

          return <span style={style}>{text}</span>
        case 'none':
          return false;
        default:
          return false;
      }
    }

    const primaryContent = sections.primary.enabled && getRenderer('primary');

    const secondaryContent = sections.secondary.enabled && getRenderer('secondary');

    const label = sections.label.enabled && getRenderer('label');

    //merge options
    let newOptions = { ...options };
    if(sections.optionOverrides.backgroundColor.type !== 'none') newOptions.colors.backgroundColor =  evalConditions(sections.optionOverrides.backgroundColor);

    //todo: unique title
    return <BaseTile ref={ref} options={newOptions} {...props} primaryContent={primaryContent} secondaryContent={secondaryContent} label={label} />
  }

  return <BaseTile ref={ref} options={options} {...props} />
});

