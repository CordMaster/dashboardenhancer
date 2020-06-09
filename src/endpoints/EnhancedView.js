import React, { useContext, Fragment } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';

const useStyles = makeStyles(theme => ({
  container: {
    boxSizing: 'border-box',

    width: '100%',
    height: '100%',

    paddingTop: 16,
    paddingLeft: 16
  },

  intContainer: {
    width: '100%',
    height: '100%',

    position: 'relative'
  },

  '@keyframes zoom': {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.2)' }
  },

  item: {
    boxSizing: 'border-box',
    position: 'absolute',
    zIndex: 1,

    padding: theme.spacing(1),

    cursor: 'pointer',

    transition: 'transform 100ms linear',

    '&:hover': {
      transform: 'scale(1.05)',
      zIndex: 2
    }
  },

  flexCenter: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    alignItems: 'center',

    height: '100%'
  },

  iconContainer: {
    flexGrow: 1
  },

  overflowText: {
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

export default function({ index }) {
  const classes = useStyles();

  const { dashboards } = useContext(MainContext);
  const { allDashboards, devices, sendCommand } = useContext(HubContext);

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
      top: `calc(${rowPercentStr} * ${tile.row - 1})`,
      left: `calc(${colPercentStr} * ${tile.col - 1})`,
    }

    let Inner = BaseTile;
    let IconOverride;
    switch (tile.template) {
      case 'switch':
        Inner = SwitchTile;
        break;
      case 'motion':
        Inner = MotionTile;
        break;
      case 'window':
        IconOverride = Icons.mdiWindowClosedVariant;
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
    return <Inner key={`${tile.id}_${device.id}`} dashboardId={dashboards[index].id} device={device} IconOverride={IconOverride} style={tileStyles} />

  });

  return (
    <Paper className={classes.container} square elevation={0}>
      <div className={classes.intContainer}>
        {tiles}
      </div>
    </Paper>
  );
}

function SwitchTile({ dashboardId, device, IconOverride, ...props }) {
  const state = device.attr.switch.value;

  const { sendCommand } = useContext(HubContext);

  const DefaultIcon = state === 'on' ? Icons.mdiToggleSwitch : Icons.mdiToggleSwitchOff;
  const iconColor = state === 'on' ? 'primary' : 'default';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    sendCommand(dashboardId, device.id, state === 'on' ? 'off' : 'on');
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} {...props} />
  )
}

function MotionTile({ dashboardId, device, IconOverride, ...props }) {
  const state = device.attr.motion.value;

  const DefaultIcon = Icons.mdiMotionSensor;
  const iconColor = state === 'active' ? 'primary' : 'default';

  const Icon = IconOverride ? IconOverride : DefaultIcon;

  const handleClick = () => {
    
  }

  return (
    <BaseTile Icon={Icon} iconColor={iconColor} label={device.label} onClick={handleClick} {...props} />
  )
}

function BaseTile({ Icon, iconColor, label, onClick, ...props }) {
  const classes = useStyles();

  return (
    <Paper className={classes.item} elevation={8} onClick={onClick} {...props}>
        <div className={classes.flexCenter}>
          <div className={`${classes.flexCenter} ${classes.iconContainer}`} style={{ fontSize: 60 }}>
            { Icon && <Icon fontSize="inherit" color={iconColor} />}
          </div>
          <Typography variant="caption" className={classes.overflowText}>{label}</Typography>
        </div>
    </Paper>
  )
}