import React, { useState, Fragment } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { CSSTransition, Transition } from 'react-transition-group';
import { useDrag } from 'react-dnd';

const useStyles = makeStyles(theme => ({
  tile: {
    boxSizing: 'border-box',
    position: 'absolute',

    width: 'auto',
    height: 'auto',

    padding: theme.spacing(2),

    zIndex: 10,

    cursor: 'pointer',

    transition: 'transform 100ms linear',

    overflow: 'hidden',

    '&:hover:not(.popped):not(.preview)': {
      transform: 'scale(1.05)',
      zIndex: 15,
    },

    '&.popped': {
      //position computed with scroll

      //weird min-height fix
      display: 'flex',

      transform: 'translate(-50%, -50%)',

      cursor: 'initial',
    },

    '&.popped-big': {
      minWidth: '75% !important',
      minHeight: '75% !important'
    },

    '&[class*="popped-"]:not(.popped-exit-done)': {
      zIndex: 100,

      transition: ['transform 250ms linear', 'min-width 250ms linear', 'min-height 250ms linear', 'top 250ms linear', 'left 250ms linear']
    },

    '&.dragging': {
      zIndex: 100,

      opacity: 0.5,

      pointerEvents: 'none',
      touchAction: 'none'
    },

    '&.relative': {
      position: 'relative',

      //to show above the drag to add box
      zIndex: 30
    },

    '&.hidden': {
      display: 'none'
    }
  },

  editCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: 'rgba(0, 0, 0, 0.25)',

    cursor: 'move'
  },

  resizeHandle: {
    position: 'absolute',

    right: -theme.spacing(2),
    bottom: -theme.spacing(2),

    width: theme.spacing(4),
    height: theme.spacing(4),

    borderRadius: theme.spacing(2),

    backgroundColor: theme.palette.primary.main,

    cursor: 'nwse-resize'
  },

  featuredContainer: {
    display: 'inline-block',

    position: 'absolute',
    top: '50%',
    left: '50%',

    transform: 'translate(-50%, -50%)',

    fontSize: '3em',

    transition:  ['transform 250ms linear', 'top 250ms linear', 'left 250ms linear', 'font-size 250ms linear']
  },

  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: '50%',

    transform: 'translateX(-50%)',

    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },

  contentText: {
    fontSize: 'inherit'
  },

  popContainer: {
    animation: '250ms $fadein',

    height: '100%',
    flexGrow: 1,

    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center'
  },

  '@keyframes fadein': {
    from: {
      opacity: 0
    },

    to: {
      opacity: 1
    }
  }
}));

export default function DragableTile({ index, tile, canDrag, isEditing, ...props }) {
  const isNew = index === -1;

  const [dragProps, dragRef] = useDrag({
    item: {
      type: 'tile',
      index,
      tile,

      isNew
    },

    canDrag,

    collect: monitor => {
      return {
        isDragging: monitor.isDragging(),
      }
    }
  });

  const [resizeDragProps, resizeDragRef] = useDrag({
    item: {
      type: 'tile-resize',
      index,
      tile
    },

    canDrag,

    collect: monitor => {
      return {
        isDragging: monitor.isDragging(),
      }
    }
  });

  const ref = {
    dragRef,
    resizeDragRef
  }

  return <PopableTile ref={ref} preview={isEditing} showConfigOverlay={isEditing} showResizeHandle={isEditing && !isNew} hidden={dragProps.isDragging || resizeDragProps.isDragging} {...props} />;
}

export const PopableTile = React.forwardRef(({ popped, setPopped, preview, ...props }, ref) => {
  const [hoverHandle, setHoverHandle] = useState(-1);

  const handleEnter = (e) => {
    if(!preview) {
      //really hacky
      if(e.nativeEvent.type === 'touchstart' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
        setHoverHandle(setTimeout(() => {
          setPopped();
        }, 1000));
      }
    }
  }

  const handleLeave = (e) => {
    if(!preview) {
      //really hacky
      if(e.nativeEvent.type === 'touchend' || e.nativeEvent.type === 'touchcancel' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
        if(hoverHandle) clearInterval(hoverHandle);
      }
    }
  }

  return <BaseTile ref={ref} popped={popped} preview={preview} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onTouchStart={handleEnter} onTouchEnd={handleLeave} onTouchCancel={handleLeave} {...props} />
});

export const BaseTile = React.forwardRef(({ label, primaryContent, secondaryContent, onClick, popped, poppedContent, containerRef, preview, relative, showConfigOverlay, showResizeHandle, isDragging, hidden, size, x, y, w, h, ...props }, ref) => {
  const classes = useStyles();

  const handleClick = (e) => {
    if(onClick && !popped) onClick(e);

    //don't exit the popup
    e.stopPropagation();
  }

  let styles = {};

  if(!size) {
    styles = {
      top: y,
      left: x,
      minWidth: w,
      minHeight: h,
      width: w,
      height: h
    }

    if(popped) {
      styles = {
        top: `calc(50% + ${containerRef.current.scrollTop}px)`,
        left: '50%',
        minWidth: '50%',
        minHeight: '25%',

        width: 'auto',
        height: 'auto'
      }
    }
  }

  return (
    <Transition in={popped} timeout={250}>
      { outerTransitionState =>
        <CSSTransition in={popped} timeout={250} classNames="popped">
          <Paper className={`${classes.tile} ${popped ? 'popped' : ''} ${popped && !poppedContent ? 'popped-big' : ''} ${relative ? 'relative' : ''} ${preview ? 'preview' : ''} ${isDragging ? 'dragging' : ''} ${hidden ? 'hidden' : ''}`} elevation={8} style={styles} onClick={handleClick} {...props}>
              { showConfigOverlay &&
                <Fragment>
                  <div ref={ref.dragRef} className={classes.editCover}></div>
              { showResizeHandle && <div className={classes.resizeHandle} ref={ref.resizeDragRef}></div> }
                </Fragment>
              }
              <CSSTransition in={popped} timeout={250} classNames="popped">
                <div className={`${classes.featuredContainer} ${popped ? 'popped' : ''}`}>
                    { primaryContent }
                    { secondaryContent }
                    { outerTransitionState === 'entered' &&
                      <div className={classes.advancedContainer}>
                        { poppedContent }
                      </div>
                    }
                </div>
              </CSSTransition>
              <div className={classes.textContainer}>
                <Typography variant="caption" className={classes.overflowText}>{label}</Typography>
              </div>
          </Paper>
        </CSSTransition>
      }
    </Transition>
  )
});

export function PreviewTileType(props) {
  return <BaseTile preview {...props} />
}

export function DragPreviewTile(props) {
  return <BaseTile preview isDragging {...props} />
}

const useDPUTStyles = makeStyles(theme => ({
  dragPreviewTile: {
    position: 'absolute',

    zIndex: 5,

    border: '1px dashed grey',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
}));

export function DragPreviewUnderTile({ x, y, w, h }) {
  const classes = useDPUTStyles();

  const tileStyles = {
    top: y,
    left: x,
    width: w,
    height: h
  }

  return <div className={classes.dragPreviewTile} style={tileStyles}></div>
}