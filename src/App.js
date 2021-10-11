import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem, { useTreeItem } from '@mui/lab/TreeItem';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';


const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `fake_token` });


const getData = async () => {
  return await octokit.request('GET /users/{name}/repos', {
    name: 'milandry',
  })
}

const nameFromEvent = event => (event.currentTarget.lastChild.innerText)

const getPrs = async name => {
  return await octokit.request('GET /repos/{owner}/{repo}/pulls', {
    owner: 'milandry',
    repo: name,
  })
}

const updatePRs = (data, prs, repo) => {
  console.log('updating PR')
  const index = data.findIndex(obj => obj.name === repo)
  data[index].prsLoaded = true
  data[index].prs = prs
  return data
}


export default function Tree() {
  const [data, setData] = useState(null);



  const CustomContent = React.forwardRef(function CustomContent(props, ref) {
    const {
      classes,
      className,
      label,
      nodeId,
      icon: iconProp,
      expansionIcon,
      displayIcon,

    } = props;

    const {
      disabled,
      expanded,
      selected,
      focused,
      handleExpansion,
      handleSelection,
      preventSelection,
    } = useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const loadPRs = async event => {
      const name = nameFromEvent(event)
      const prs = await getPrs(name)
      const oldData = data

      const newData = updatePRs([...oldData], prs.data, name)
      console.log('setting data')
      setData(newData)
    }


    const handleMouseDown = async (event) => {
      preventSelection(event);
      loadPRs(event);

    };

    const handleExpansionClick = (event) => {

      handleExpansion(event);
      // loadPRs(event);
    };

    const handleSelectionClick = (event) => {

      handleSelection(event);
      // loadPRs(event);
    };

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={clsx(className, classes.root, {
          [classes.expanded]: expanded,
          [classes.selected]: selected,
          [classes.focused]: focused,
          [classes.disabled]: disabled,
        })}
        onMouseDown={handleMouseDown}
        ref={ref}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography
          onClick={handleSelectionClick}
          component="div"
          className={classes.label}
        >
          {label}
        </Typography>
      </div>
    );
  });

  CustomContent.propTypes = {
    /**
     * Override or extend the styles applied to the component.
     */
    classes: PropTypes.object.isRequired,
    /**
     * className applied to the root element.
     */
    className: PropTypes.string,
    /**
     * The icon to display next to the tree node's label. Either a parent or end icon.
     */
    displayIcon: PropTypes.node,
    /**
     * The icon to display next to the tree node's label. Either an expansion or collapse icon.
     */
    expansionIcon: PropTypes.node,
    /**
     * The icon to display next to the tree node's label.
     */
    icon: PropTypes.node,
    /**
     * The tree node label.
     */
    label: PropTypes.node,
    /**
     * The id of the node.
     */
    nodeId: PropTypes.string.isRequired,
  };

  const CustomTreeItem = (props) => {
    return (<TreeItem ContentComponent={CustomContent} {...props} />)
  };



  useEffect(() => {

    if (data === null) {
      getData()
      .then(response => {
        console.log('response', response)
        console.log('response.data', response.data)
        const repos = response.data.map(repo => ({name: repo.name, prsLoaded:false, prs: []}))
        setData(repos)

      })
    }
  })


  const repos = data
    ? data.map((repo) => {
      debugger

      const prs = repo.prs.map( pr => {
        debugger
        return (<TreeItem nodeId={pr.url} key={pr.url} label={pr.url} />)
      })

      return (  <CustomTreeItem nodeId={repo.name} key={repo.name} label={repo.name} >
        {prs}
        {(!repo.prsLoaded) ?  <TreeItem label="placeholder"/>: null}

      </CustomTreeItem>)
    })
    : null;



  return (
    <TreeView
      aria-label="icon expansion"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    >
                {repos}
    </TreeView>
  );
}
