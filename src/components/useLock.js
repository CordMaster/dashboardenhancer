import React, { useState, useContext, useMemo, Fragment } from 'react';
import { MainContext } from '../contexts/MainContextProvider';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, withMobileDialog, Typography } from '@material-ui/core';

export default function() {
  const { locked, setLocked, save } = useContext(MainContext);

  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  
  const provided = <LockDialog locked={locked} setLocked={setLocked} open={open} setOpen={setOpen} save={save} />
  

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

function LockDialogContent({ locked, setLocked, exiting, closeDialog, save }) {
  const isLocked = locked !== -1;

  const [tempCode, setTempCode] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if(isLocked) {
      if(tempCode === locked) {
        setLocked(false);
        closeDialog();
      }
      else setError(true);
    } else {
      if(!setLocked(true)) setError(true);
      else {
        save();
        closeDialog();
      }
    }
  }

  if(!exiting) {
    return (
      <Fragment>
        <DialogTitle>{isLocked ? "Enter lock code" : "Lock HubiPanel?"}</DialogTitle>
        <DialogContent>
          {isLocked ? <TextField fullWidth label="Code" error={error} value={tempCode} onChange={(e) => setTempCode(e.target.value)} /> : (error ? <Typography color="error">Please set a code in settings first</Typography> : <Typography color="error">Locking will save your settings</Typography>) }
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>{isLocked ? "Validate" : "Lock"}</Button>
        </DialogActions>
      </Fragment>
    );
  } else return false;
}