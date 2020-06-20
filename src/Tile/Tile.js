import React, { useState, Fragment } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { CSSTransition, Transition } from 'react-transition-group';
import { useDrag } from 'react-dnd';
import { ContactsOutlined } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  tile: {
    boxSizing: 'border-box',
    position: 'absolute',

    width: 'auto',
    height: 'auto',

    padding: theme.spacing(2),

    zIndex: 1,

    cursor: 'pointer',

    transition: 'transform 100ms linear',

    overflow: 'hidden',

    '&:hover:not(.popped):not(.preview)': {
      transform: 'scale(1.05)',
      zIndex: 2,
    },

    '&.popped': {
      //position computed with scroll

      //weird min-height fix
      display: 'flex',

      transform: 'translate(-50%, -50%)',

      cursor: 'initial',
    },

    '&.popped-big': {
      width: 'calc(75% - 16px) !important',
      height: 'calc(75% - 16px) !important',
    },

    '&[class*="popped-"]:not(.popped-exit-done)': {
      zIndex: 4,

      transition: ['transform 250ms linear', 'min-width 250ms linear', 'min-height 250ms linear', 'top 250ms linear', 'left 250ms linear']
    },

    '&.dragging': {
      
    },

    '&.relative': {
      position: 'relative',
      height: 250,
      margin: '16px 0',
    },

    '&.dragPreview': {
      zIndex: 200,

      opacity: 0.5,

      pointerEvents: 'none',
      touchAction: 'none'
    }
  },

  editCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: 'rgba(0, 0, 0, 0.25)'
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

export default function DragableTile({ index, canDrag, isEditing, x, y, ...props }) {
  const [dragProps, dragRef] = useDrag({
    item: {
      type: 'tile',
      index
    },

    canDrag,

    collect: monitor => {
      return {
        isDragging: monitor.isDragging(),

        delta: monitor.getDifferenceFromInitialOffset()
      }
    }
  });

  const dragPosition = {
    x: dragProps.delta ? `calc(${x} + ${dragProps.delta.x}px)` : 0,
    y: dragProps.delta ? `calc(${y} + ${dragProps.delta.y}px)` : 0,
  }

  return (
    <Fragment>
      <PopableTile ref={dragRef} x={x} y={y} showHandles={!dragProps.isDragging && isEditing} {...dragProps} {...props} />
      { dragProps.isDragging && <BaseTile dragPreview {...dragPosition} {...props} /> }
    </Fragment>
  );
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

export const BaseTile = React.forwardRef(({ label, primaryContent, secondaryContent, onClick, popped, poppedContent, containerRef, preview, dragPreview, relative, showHandles, isDragging, x, y, w, h, ...props }, ref) => {
  const classes = useStyles();

  const handleClick = (e) => {
    if(onClick && !popped) onClick(e);

    //don't exit the popup
    e.stopPropagation();
  }

  let styles = {};

  if(!relative) {
    const tileStyles = {
      top: y,
      left: x,
      minWidth: w,
      minHeight: h,
      width: w,
      height: h
    }

    const poppedStyles = {
      top: `calc(50% + ${containerRef.current.scrollTop}px)`,
      left: '50%',
      minWidth: 'calc(50% - 16px)',
      minHeight: 'calc(25% - 16px)',

      width: 'auto',
      height: 'auto'
    }

    styles = popped ? poppedStyles : tileStyles;
  }

  return (
    <Transition in={popped} timeout={250}>
      { outerTransitionState =>
        <CSSTransition in={popped} timeout={250} classNames="popped">
          <Paper ref={ref} className={`${classes.tile} ${popped ? 'popped' : ''} ${popped && !poppedContent ? 'popped-big' : ''} ${relative ? 'relative' : ''} ${preview ? 'preview' : ''} ${isDragging ? 'dragging' : ''} ${dragPreview ? 'dragPreview' : ''}`} elevation={8} style={styles} onClick={handleClick} {...props}>
              { showHandles &&
                <div className={classes.editCover}>
                  <div className={classes.resizeHandle}></div>
                </div>
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