import React, { useContext, Fragment, useState, useEffect } from 'react';
import $ from 'jquery';
import { Paper, makeStyles, Typography, FormControl, FormControlLabel, Switch, duration } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { CSSTransition, Transition } from 'react-transition-group';
import FullSlider from '../components/FullSlider';

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

    padding: theme.spacing(2),

    zIndex: 1,

    cursor: 'pointer',

    transition: 'transform 100ms linear',

    '&:hover:not(.popped)': {
      transform: 'scale(1.05)',
      zIndex: 2,
    },

    '&.popped': {
      top: '50% !important',
      left: '50% !important',
      minWidth: 'calc(50% - 16px) !important',
      minHeight: 'calc(25% - 16px) !important',

      width: 'auto !important',
      height: 'auto !important',

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

      transition: ['transform 250ms linear', 'width 250ms linear', 'height 250ms linear', 'top 250ms linear', 'left 250ms linear']
    }
  },

  popCover: {
    position: 'absolute',

    top: '-16px',
    left: '-16px',
    right: 0,
    bottom: 0,

    zIndex: 3,

    display: 'none',
    opacity: 0,


    backgroundColor: 'black',
    transition: 'opacity 250ms linear',

    '&.popped': {
      display: 'block',
      opacity: 0.5
    }
  },

  featuredContainer: {
    display: 'inline-block',

    position: 'absolute',
    top: '50%',
    left: '50%',

    transform: 'translate(-50%, -50%)',

    fontSize: 60,

    transition:  ['transform 250ms linear', 'top 250ms linear', 'left 250ms linear', 'font-size 250ms linear'],

    '&.popped': {
      top: '50%',
      left: 16,

      transform: 'translate(0, -50%)',

      fontSize: 100,
    },

    '&.popped-enter-done': {
      boxSizing: 'border-box',
      position: 'initial',

      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',

      padding: `${theme.spacing(2)}px 0`,

      transform: 'none',
      transition: 'none',

      '&>*': {
        marginRight: theme.spacing(2)
      }
    }
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
  },

  iframeAttribute: {
    width: '100%',
    height: '100%',

    border: 'none'
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

export default function({ index, className, ...props }) {
  const classes = useStyles();

  const { dashboards } = useContext(MainContext);
  const { allDashboards, devices, sendCommand } = useContext(HubContext);

  //tile popping
  const [popped, setPopped] = useState(-1);

  useEffect(() => {
    const unPop = () => {
      setPopped(-1);
    }

    window.addEventListener('click', unPop);
    return () => window.removeEventListener('click', unPop);
  }, []);
  //tile popping

  const layout = allDashboards[dashboards[index].id].layout;
  console.log(layout);

  //rows and cols are 1-indexed
  const tiles = layout.tiles.map(tile => {
    const device = devices[tile.device];

    const colPercentStr = `calc(100% / ${layout.cols / tile.colSpan})`;
    const rowPercentStr = `calc(100% / ${layout.rows / tile.rowSpan})`;
    const tileStyles = {
      width: `calc(${colPercentStr} - 16px)`,
      height: `calc(${rowPercentStr} - 16px)`,
      top: `calc(calc(100% / ${layout.rows}) * ${tile.row - 1})`,
      left: `calc(calc(100% / ${layout.cols}) * ${tile.col - 1})`,
    }

    let Inner = BaseTile;
    let IconOverride;
    switch (tile.template) {
      case 'switch':
        Inner = SwitchTile;
        break;
      case 'dimmer':
        Inner = SwitchTile;
        break;
      case 'motion':
        Inner = MotionTile;
        break;
      case 'window':
        Inner = WindowTile;
        break;
      case 'contact':
        Inner = ContactTile;
        break;
      case 'bulb':
        Inner = SwitchTile;
        break;
      case 'attribute':
        Inner = AttributeTile;
        break;
      case 'temperature':
        Inner = AttributeTile;
        break;
      case 'humidity':
        Inner = AttributeTile;
        break;
      default:
        IconOverride = false;
        break;
    }

    if(tile.customIcon) {
      const preProcIcon = tile.customIcon.replace('he-', '').replace(/_[0-9]/g, '').replace(/[0-9]/g, '');
      const regExpr = /_([a-z])/g;
      let match;
      let fixedSearch = preProcIcon;
      while((match = regExpr.exec(preProcIcon)) !== null) {
        fixedSearch = fixedSearch.replace(match[0], match[1].toUpperCase());
      }

      IconOverride = getIcon(fixedSearch);
    }

    if(Inner !== BaseTile) return <Inner key={`${tile.id}_${device.id}`} dashboardId={dashboards[index].id} tile={tile} device={device} IconOverride={IconOverride} style={tileStyles} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} />
    else return <Inner key={`${tile.id}_${device.id}`} dashboardId={dashboards[index].id} tile={tile} device={device} label={device.label} Icon={Icons.mdiAlertCircle} style={tileStyles} popped={popped === tile.id} setPopped={() => setPopped(tile.id)} />
  });

  return (
    <Paper className={`${classes.container} ${className}`} square elevation={0} {...props}>
      <div className={classes.intContainer}>
        {tiles}
        <div className={`${classes.popCover} ${popped !== -1 && 'popped'}`}></div>
      </div>
    </Paper>
  );
}

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

function MotionTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.motion.value;

  const DefaultIcon = Icons.mdiMotionSensor;
  const iconColor = state === 'active' ? 'secondary' : 'inherit';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile dashboardId={dashboardId} Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} device={device} {...props} />
  )
}

function WindowTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.contact.value;

  const DefaultIcon = state === 'open' ? Icons.mdiWindowOpenVariant : Icons.mdiWindowClosedVariant;
  const iconColor = state === 'open' ? 'secondary' : 'inherit';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile dashboardId={dashboardId} Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} device={device} {...props} />
  )
}

function ContactTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = device.attr.contact.value;

  const DefaultIcon = state === 'open' ? Icons.mdiDoorOpen : Icons.mdiDoorClosed;
  const iconColor = state === 'open' ? 'secondary' : 'inherit';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile dashboardId={dashboardId} Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} device={device} {...props} />
  )
}

function AttributeTile({ dashboardId, tile, device, IconOverride, ...props }) {
  const state = tile.templateExtra ? device.attr[tile.templateExtra].value : device.attr[tile.template].value;

  return (
    <BaseTile dashboardId={dashboardId} content={state} label={device.label} device={device} {...props} />
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

function BaseTile({ dashboardId, label, Icon, iconColor, content, onClick, popped, setPopped, device, ...props }) {
  const classes = useStyles();

  const { sendCommand } = useContext(HubContext);

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
      }, 1500));
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

  const isiframe = content && content.includes('iframe');

  return (
    <Transition in={popped} timeout={250}>
      { outerTransitionState =>
        <CSSTransition in={popped} timeout={250} classNames="popped">
          <Paper className={`${classes.item} ${popped ? 'popped' : ''} ${popped && isiframe ? 'popped-big' : ''}`} elevation={8} onClick={handleClick} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onTouchStart={handleEnter} onTouchEnd={handleLeave} onTouchCancel={handleLeave} {...props}>
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