import React, { useState, useContext, useMemo, Fragment } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, withMobileDialog, Typography, makeStyles } from '@material-ui/core';

export default function(label, renderProp, onApply, maxWidth = 'sm') {
  const [openIndex, setOpenIndex] = useState(-1);

  const open = openIndex !== -1;

  const pLabel = open ? (typeof(label) === 'string' ? label : label(openIndex)) : '';
  
  const provided = (
    <WMDialog maxWidth={maxWidth} label={pLabel} renderProp={() => renderProp(openIndex)} open={open} setOpenIndex={setOpenIndex} onApply={() => onApply(openIndex)} />
  );
  

  return [provided, setOpenIndex];
}

const WMDialog = withMobileDialog({ breakpoint: 'xs' })(WMDialogM);

function WMDialogM({ label, renderProp, open, setOpenIndex, onApply, fullScreen, ...props }) {
  const closeDialog = () => setOpenIndex(-1);

  const [exiting, setExiting] = useState(false);

  return (
    <Dialog fullWidth fullScreen={fullScreen} open={open} onClose={closeDialog} onExiting={() => setExiting(true)} onExited={() => setExiting(false)} {...props}>
      {open &&
      <Fragment>
        <DialogTitle>{label}</DialogTitle>
        {renderProp()}
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button color="primary" onClick={() => onApply() & closeDialog()}>Apply</Button>
        </DialogActions>
      </Fragment>
      }
    </Dialog>
  );
}