import React, { Fragment, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { List, ListItem, ListItemIcon, ListItemText, DialogContent, DialogActions, Button, TextField, Typography } from '@material-ui/core';

import Error from '@material-ui/icons/Error';
import * as Icons from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  filter: {
    //padding: `0 ${theme.spacing.unit * 2}px`,
    paddingBottom: theme.spacing(1)
  }
}));

function IconSelect({ value, onChange }) {
  const classes = useStyles();

  const [filter, setFilter] = useState('');

  return (
    <div>
      <div className={classes.filter}>
        <TextField fullWidth type="text" label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)}/>
      </div>
      
      <DataList data={Object.keys(Icons)} selectedItem={value} onSelect={onChange} filter={filter} ListItemTemplate={IconListItem} />
    </div>
  );
}

IconSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

const useDataListStyle = makeStyles(theme => ({
  list: {
    overflowY: 'auto',

    height: 300
  }
}));

function DataList({ data, selectedItem, onSelect, ListItemTemplate, filter }) {
  const classes = useDataListStyle();

  const hasFilter = filter !== '';

  //reset loaded items for filter
  useEffect(() => {
    setLoadedItems(25);
  }, [filter]);

  const [loadedItems, setLoadedItems] = useState(25);
  //load more icons as we scroll
  const handleScroll = (e) => {
    const scrollBottom = e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;
    
    //arbitrary px value?
    if(scrollBottom < 200) setLoadedItems(loadedItems + 25);
  }

  const trimmedData = useMemo(() => data.filter((item) => hasFilter ? item.toLowerCase().includes(filter.toLowerCase()) : true).slice(0, loadedItems), [data, hasFilter, loadedItems, filter]);
  const uiItems = trimmedData.map((item) => <ListItemTemplate key={item} item={item} selected={selectedItem === item} onSelect={onSelect} />);

  if(uiItems.length === 0) {
    uiItems.push(
      <ListItem button disabled key={'noresults'}>
        <ListItemText primary="No icon found" secondary="Try rephrasing your filter" />
      </ListItem>
    );
  }

  return (
    <List className={classes.list} onScroll={handleScroll}>
      {uiItems}
    </List>
  );
}

//basic optimization for list items
const IconListItem = React.memo(function ({ item: icon, selected, onSelect }) {
  const IconElem = Icons[icon];
  const error = IconElem ? false : true;

  return (
    <ListItem button selected={selected} disabled={error} onClick={() => onSelect(icon) }>
      <ListItemIcon>
        {error ? <Error/> : <IconElem />}
      </ListItemIcon>
      <ListItemText primary={icon} />
    </ListItem>
  );
});

export default IconSelect;