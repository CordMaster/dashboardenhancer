import React from 'react';
import { Grid, Typography, TextField, FormControl, InputLabel, MenuItem, Select, Tab } from '@material-ui/core';
import useCollection from '../contexts/useCollection';

export function PropertyTab({ property, modifyProperty }) {
  const [conditions, modifyConditions] = useCollection(property.conditions, {});

  return (
    <Tab>
      Test
    </Tab>
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