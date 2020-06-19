import React, { useState, useContext, useMemo, Fragment } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, withMobileDialog, Typography } from '@material-ui/core';

export default function(label, renderProp) {
  const [openIndex, setOpenIndex] = useState(-1);
  
  const provided = (
    <WMDialog label={label} renderProp={() => renderProp(openIndex)} open={openIndex !== -1} setOpenIndex={setOpenIndex} />
  );
  

  return [provided, setOpenIndex];
}

const WMDialog = withMobileDialog({ breakpoint: 'xs' })(WMDialogM);

function WMDialogM({ label, renderProp, open, setOpenIndex, fullScreen }) {
  const closeDialog = () => setOpenIndex(-1);

  const [exiting, setExiting] = useState(false);

  return (
    <Dialog fullWidth fullScreen={fullScreen} open={open} onClose={closeDialog} onExiting={() => setExiting(true)} onExited={() => setExiting(false)}>
      <DialogTitle>{label}</DialogTitle>
      <DialogContent>
        {renderProp()}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        {/*<Button onClick={handleSubmit}>Done</Button>*/}
      </DialogActions>
    </Dialog>
  );
}