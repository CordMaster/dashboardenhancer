import React, { useState, Fragment, useContext } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { BaseTile } from './Tile';
import { multipleClasses, evalExpr } from '../Utils';
import { MainContext } from '../contexts/MainContextProvider';
import defaultHubitatTileDefinitions from '../definitions/defaultHubitatTileDefinitions';
import { HubContext } from '../contexts/HubContextProvider';
import validHubitatTileDefinitionProperties from '../definitions/validHubitatTileDefinitionProperties';
import Icons from '../Icons';
import Color from 'color';

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
  const { hubitatTileDefinitions } = useContext(MainContext);

  const allHubitatTileDefinitions = defaultHubitatTileDefinitions.concat(hubitatTileDefinitions);

  if(options.deviceInfo.device && options.deviceInfo.type) {
    const device = devices[options.deviceInfo.device];
    const tileDefinition = allHubitatTileDefinitions.find(it => it.id === options.deviceInfo.type);
    const sections = tileDefinition.sections;

    console.log(tileDefinition);

    const getRenderer = sectionName => {
      const section = sections[sectionName];

      const evalConditions = propertyName => {
        const conditions = section[propertyName];

        const isConstant = !Array.isArray(conditions);
  
        const prepare = obj => {
          if(typeof(obj) !== 'string') return obj;

          let ret = obj;
  
          Object.entries(device.attributes).forEach(([attributeName, attribute]) => {
            ret = ret.replace(`%${attributeName}%`, attribute.currentState);
          });
  
          return ret.replace('%deviceName%', device.label);
        }
  
        if(isConstant) return prepare(conditions);
  
        else {
          let ret;
  
          conditions.forEach(condition => {
            const attribute = device.attributes[condition.attributeName];

            //TODO: break?
            if(attribute && evalExpr(attribute.currentState, condition.comparator, condition.requiredState)) ret = condition.value;
          });
  
          return prepare(ret);
        }
      }

      switch(section.type) {
        case 'icon':
          var Icon = Icons[evalConditions('iconName')];
          var color = evalConditions('color');

          var style = { color: Color(color).rgb().string() };

          return (
            <Icon style={style} />
          );
        case 'text':
          var text = evalConditions('value');
          var color = evalConditions('color');

          var style = { color: Color(color).rgb().string() };

          if(sectionName === 'primary') return <Typography variant="h5" style={style}>{text}</Typography>;
          else if(sectionName === 'primary') return <Typography variant="subtitle2" style={style}>{text}</Typography>;
          else return <span style={style}>{text}</span>;
        case 'none':
          return false;
        default:
          return false;
      }
    }

    const primaryContent = sections.primary.enabled && getRenderer('primary');

    const secondaryContent = sections.secondary.enabled && getRenderer('secondary');

    const label = sections.label.enabled && getRenderer('label');

    //todo: unique title
    return <BaseTile ref={ref} options={options} {...props} primaryContent={primaryContent} secondaryContent={secondaryContent} label={label} />
  }

  return <BaseTile ref={ref} options={options} {...props} />
});

