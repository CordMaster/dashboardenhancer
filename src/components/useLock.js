import React, { useState, useContext, useMemo, Fragment } from 'react';
import { MainContext } from '../contexts/MainContextProvider';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, withMobileDialog } from '@material-ui/core';

export default function() {
  const { locked, setLocked } = useContext(MainContext);

  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  
  const provided = <LockDialog locked={locked} setLocked={setLocked} open={open} setOpen={setOpen} />
  

  return [locked, openDialog, provided];
}

const LockDialog = withMobileDialog({ breakpoint: 'xs' })(LockDialogM);

function LockDialogM({ open, setOpen, fullScreen, ...props }) {
  const closeDialog = () => setOpen(false);

  const [exiting, setExiting] = useState(false);

  return (
    <Dialog fullWidth fullScreen={fullScreen} open={open} onClose={closeDialog} onExiting={() => setExiting(true)} onExited={() => setExiting(false)}>
      <LockDialogContent {...props} exiting={exiting} closeDialog={closeDialog} />
    </Dialog>
  );
}

function LockDialogContent({ locked, setLocked, exiting, closeDialog }) {
  const isLocked = locked !== -1;

  const [tempCode, setTempCode] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if(tempCode) {
      if(isLocked) {
        if(tempCode === locked) {
          setLocked(-1);
          closeDialog();
        }
        else setError(true);
      } else {
        setLocked(tempCode);
        closeDialog();
      }
    }
  }

  if(!exiting) {
    return (
      <Fragment>
        <DialogTitle>{isLocked ? "Enter lock code" : "Set lock code"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="number" label="Code" error={error} value={tempCode} onChange={(e) => setTempCode(parseInt(e.target.value))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>{isLocked ? "Validate" : "Set Code"}</Button>
        </DialogActions>
      </Fragment>
    );
  } else return false;
}