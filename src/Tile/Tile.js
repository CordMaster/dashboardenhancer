import React, { useContext, Fragment, useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { CSSTransition, Transition } from 'react-transition-group';
import FullSlider from '../components/FullSlider';
import { devLog } from '../Utils';

const useStyles = makeStyles(theme => ({
  container: {
    boxSizing: 'border-box',

    width: '100%',
    height: '100%',

    paddingTop: 16,
    paddingLeft: 16,

    overflow: 'hidden',

    userSelect: 'none'
  },

  intContainer: {
    width: '100%',
    height: '100%',

    position: 'relative'
  },

  item: {
    boxSizing: 'border-box',
    position: 'absolute',

    width: 'auto',
    height: 'auto',

    padding: theme.spacing(2),

    zIndex: 1,

    cursor: 'pointer',

    transition: 'transform 100ms linear',

    '&:hover:not(.popped)': {
      transform: 'scale(1.05)',
      zIndex: 2,
    }
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

  advancedContainer: {
    animation: '250ms $fadein',

    height: '100%',
    flexGrow: 1,

    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center'
  }
}));

function SwitchTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.switch.value;

  const isOn = state === 'on';

  const { sendCommand } = useContext(HubContext);

  const DefaultIcon = isOn ? Icons.mdiToggleSwitch : Icons.mdiToggleSwitchOffOutline;
  const iconColor = isOn ? 'primary' : 'inherit';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    sendCommand(dashboardId, device.id, state === 'on' ? 'off' : 'on');
  }

  return (
    <BaseTile dashboardId={dashboardId} Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} device={device} {...props} />
  )
}

function MotionTile({ tile, device, IconOverride, ...props }) {
  const state = device.attr.motion.value;

  const DefaultIcon = Icons.mdiMotionSensor;
  const iconColor = state === 'active' ? 'secondary' : 'inherit';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} device={device} {...props} />
  )
}

function WindowTile({ device, IconOverride, ...props }) {
  const state = device.attr.contact.value;

  const DefaultIcon = state === 'open' ? Icons.mdiWindowOpenVariant : Icons.mdiWindowClosedVariant;
  const iconColor = state === 'open' ? 'secondary' : 'inherit';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} device={device} {...props} />
  )
}

function ContactTile({ device, IconOverride, ...props }) {
  const state = device.attr.contact.value;

  const DefaultIcon = state === 'open' ? Icons.mdiDoorOpen : Icons.mdiDoorClosed;
  const iconColor = state === 'open' ? 'secondary' : 'inherit';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} device={device} {...props} />
  )
}

function AttributeTile({ tile, device, IconOverride, ...props }) {
  const attr = tile.templateExtra ? device.attr[tile.templateExtra] : device.attr[tile.template];
  const state = attr ? attr.value : 'E';

  return (
    <BaseTile content={state} label={device.label} device={device} {...props} />
  )
}

//attr function types
const attrInfos = {
  'switch' : {
    type: 'boolean',
    trueStr: 'on',
    falseStr: 'off'
  },

  'level' : {
    type: 'range',
    min: 0,
    max: 100,
    step: 5
  },

  'saturation' : {
    type: 'range',
    min: 0,
    max: 100,
    step: 5
  },

  'hue' : {
    type: 'range',
    min: 0,
    max: 100,
    step: 5
  },

  'colorTemperature' : {
    type: 'range',
    min: 0,
    max: 6536,
    step: 100
  }
}

export default function BaseTile({ label, primaryContent, secondaryContent, onClick, config, popped, setPopped, poppedContent, device, containerRef, x, y, w, h, ...props }) {
  const classes = useStyles();

  const [hoverHandle, setHoverHandle] = useState(-1);

  const handleClick = (e) => {
    if(onClick && !popped) onClick(e);

    //don't exit the popup
    e.stopPropagation();
  }

  const handleEnter = (e) => {
    //really hacky
    if(e.nativeEvent.type === 'touchstart' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
      setHoverHandle(setTimeout(() => {
        setPopped();
      }, 1000));
    }
  }

  const handleLeave = (e) => {
    //really hacky
    if(e.nativeEvent.type === 'touchend' || e.nativeEvent.type === 'touchcancel' || (e.nativeEvent.sourceCapabilities && !e.nativeEvent.sourceCapabilities.firesTouchEvents)) {
      if(hoverHandle) clearInterval(hoverHandle);
    }
  }

  const advancedOptions = Object.values(device.attr).sort((a, b) => a.name > b.name ? 1 : -1).map(attr => {
    const attrInfo = attrInfos[attr.name];
    if(attrInfo) {
      switch(attrInfo.type) {
        case 'boolean':
          const isTrue = attr.value === attrInfo.trueStr;

          return (
            <FormControl key={attr.name}>
              <FormControlLabel control={<Switch />} label={attr.name} checked={isTrue} onChange={() => sendCommand(dashboardId, device.id, isTrue ? attrInfo.falseStr : attrInfo.trueStr) } />
            </FormControl>
          );
        case 'range':
          return <FullSlider style={{ marginLeft: -16 }} label={attr.name} min={attrInfo.min} max={attrInfo.max} step={attrInfo.step} value={attr.value} onChange={(value) => sendCommand(dashboardId, device.id, `set${attr.name.charAt(0).toUpperCase() + attr.name.substring(1)}`, value) } bufferChange />
        default:
          return false;
        }
      } else return <Typography gutterBottom variant="subtitle1">{attr.name}: {attr.value}</Typography>;
  });

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

  const styles = popped ? poppedStyles : tileStyles;

  return (
    <Transition in={popped} timeout={250}>
      { outerTransitionState =>
        <CSSTransition in={popped} timeout={250} classNames="popped">
          <Paper className={`${classes.item} ${popped ? 'popped' : ''} ${popped && isiframe ? 'popped-big' : ''}`} elevation={8} style={styles} onClick={handleClick} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onTouchStart={handleEnter} onTouchEnd={handleLeave} onTouchCancel={handleLeave} {...props}>
              { isiframe && <iframe className={classes.iframeAttribute} title={$.parseHTML(content)[1].src} src={$.parseHTML(content)[1].src}></iframe> }
              { !isiframe &&
                <CSSTransition in={popped} timeout={250} classNames="popped">
                  <div className={`${classes.featuredContainer} ${popped ? 'popped' : ''}`}>
                      { Icon && <Icon fontSize="inherit" color={iconColor} /> }
                      { content && <Typography className={classes.contentText}>{content}</Typography> }
                      { outerTransitionState === 'entered' &&
                        <div className={classes.advancedContainer}>
                          {advancedOptions}
                        </div>
                      }
                  </div>
                </CSSTransition>
              }
              <div className={classes.textContainer}>
                <Typography variant="caption" className={classes.overflowText}>{label}</Typography>
              </div>
          </Paper>
        </CSSTransition>
      }
    </Transition>
  )
}