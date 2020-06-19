import React, { useState, Fragment } from 'react';

import { Typography, TextField, Switch, FormControlLabel, FormControl } from '@material-ui/core';
import ColorPicker from '../components/colorpicker/ColorPicker';
import DevicePicker from '../components/devicepicker/DevicePicker';

//util for autogen configs
export default function(definitions) {
  //so we can update multiple items in the state at once
  let preStateUpdate = {};

  let def = {};
  
  Object.values(definitions).forEach((section) => {
    section.sectionOptions.forEach(field => {
      def[field.name] = field.default;
    });
  });

  const [state, setState] = useState(def);

  function updateAffects(field, newVal) {
    field.affects.forEach(affected => {
      if(newVal === affected.value) {
        preStateUpdate[affected.name] = affected.setTo;
  
        //recursive changes
        //find field affected
        const affectedField = Object.values(definitions).reduce((sum, section) => {
          const affectedFieldIndex = section.sectionOptions.findIndex(field => field.name === affected.name);
          if(affectedFieldIndex !== -1) return section.sectionOptions;
          else return sum;
        }, []);

        if(affectedField.affects) updateAffects(affectedField, affected.setTo);
      };
    });
  }

  let ret = {};
  let setRet = {};
  Object.values(definitions).forEach((section) => {
    section.sectionOptions.forEach(field => {
    
    ret[field.name] = state[field.name];
    setRet[field.name] = (newVal) => {
      //set the state
      preStateUpdate[field.name] = newVal;

      //set the other states
      if(field.affects) {
        updateAffects(field, newVal);
      }

      setState(Object.assign({}, state, preStateUpdate));
    }
    });
  });

  const mergeAll = (other) => {
    setState(Object.assign({}, state, other));
  }

  return [ret, setRet, mergeAll];
}

export const useSectionRenderer = (section, config, setConfig, state) => {
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

  return [children, handleSave, noShow];
};

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