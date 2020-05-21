import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import { Dialog, withMobileDialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@material-ui/core';

import * as Icons from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import IconSelect from './IconSelect.js';

function IconSelectDialog({ open, onApply, onClose, fullScreen }) {
  return (
    <Dialog fullWidth fullScreen={fullScreen} open={open} onClose={onClose}>
      {/* only mount content if we are open transition fix? */}
      {open && <Content onApply={onApply} onClose={onClose} />}
    </Dialog>
  );
}

IconSelectDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

const useContentStyle = makeStyles(theme => ({
  selectedIconIndicatorContainer: {
    flex: '1 0 0'
  },

  selectedIconIndicator: {
    verticalAlign: 'middle'
  }
}));

function Content({ onApply, onClose }) {
  const classes = useContentStyle();

  const [selectedIcon, setSelectedIcon] = useState('');
  const SelectedIconElem = Icons[selectedIcon];

  return (
    <Fragment>
      <DialogTitle>
        {'Pick an icon'}
      </DialogTitle>

      <DialogContent>
        <IconSelect value={selectedIcon} onChange={setSelectedIcon} />
      </DialogContent>

      {/*<GraphDialogBase changedGraph={changedGraph} trackChange={trackChange} onClose={onClose} onApply={apply} />*/}
      <DialogActions>
          {selectedIcon !== '' && (
            <div className={classes.selectedIconIndicatorContainer}>
              <Typography variant="subtitle1">
                Selected icon:  <SelectedIconElem className={classes.selectedIconIndicator}/>
              </Typography>
              
            </div>
          )}
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" disabled={!selectedIcon ? true : false} onClick={() => onApply(selectedIcon) & onClose()}>Apply</Button>
      </DialogActions>
    </Fragment>
  );
}

export default withMobileDialog({ breakpoint: 'xs' })(IconSelectDialog);