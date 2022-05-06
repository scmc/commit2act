import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tab,
  Tabs,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { getAllGroups } from '../graphql/queries';
import { API } from 'aws-amplify';
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import theme from '../themes';

const Leaderboard = ({ currentGroup, groupMembers, userId }) => {
  const tabs = ['Global Groups', 'Group Members'];
  const filters = [
    { name: 'Total CO2 Saved', property: 'total_co2' },
    { name: 'Weekly CO2 Saved', property: 'weekly_co2' },
    { name: 'Total Points', property: 'total_points' },
    { name: 'Weekly Points', property: 'weekly_points' },
  ];
  const [groups, setGroups] = useState();
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [filteredGroups, setFilteredGroups] = useState();
  const [filteredMembers, setFilteredMembers] = useState();
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  useEffect(() => {
    const getGroups = async () => {
      const res = await API.graphql({
        query: getAllGroups,
      });
      setGroups(res.data.getAllGroups);
    };
    getGroups();
  }, []);

  useEffect(() => {
    //filter groups and users by total co2 as default view
    if (groups && groupMembers) {
      handleFilterSelection(filters[0]);
    }
  }, [groups, groupMembers, selectedTab]);

  const handleTabChange = (e, newValue) => {
    setSelectedTab(newValue);
  };

  /** functions for filter menu */
  const handleClick = (e) => {
    setFilterMenuAnchor(e.currentTarget);
    setOpenFilterMenu(true);
  };

  const handleClose = () => {
    setFilterMenuAnchor(null);
    setOpenFilterMenu(false);
  };

  const handleFilterSelection = (filter) => {
    const propertySelected = filter.property;
    //if Global Group tab is selected, apply the selected filter to all groups
    if (selectedTab === tabs[0]) {
      const sortedByFilter = groups.sort(
        (a, b) => b[propertySelected] - a[propertySelected]
      );
      setFilteredGroups(sortedByFilter);
    }
    //if Group Members tab is selected, apply the selected filter to all users
    if (selectedTab === tabs[1]) {
      const sortedByFilter = groupMembers.sort(
        (a, b) => b[propertySelected] - a[propertySelected]
      );
      setFilteredMembers(sortedByFilter);
    }
    handleClose();
  };

  /** function for displaying the leaderboard tables */

  const renderTable = () => {
    return (
      <>
        {/* if Global Groups tab is selected, render group current place */}
        <Box>
          {filteredGroups && selectedTab === tabs[0] && (
            <>
              <Typography variant="h3">Current Place</Typography>
              <Typography variant="h1" sx={{ mt: '0.2em' }}>
                <AutoGraphIcon />
                {filteredGroups.findIndex(
                  (group) => group.group_name === currentGroup.group_name
                ) + 1}{' '}
                / {filteredGroups.length}
              </Typography>
            </>
          )}
          {/* if Group Members tab is selected, check if user is a group member, then render user's current place */}
          {groupMembers &&
            selectedTab === tabs[1] &&
            groupMembers.findIndex((member) => member.user_id === userId) !==
              -1 && (
              <>
                <Typography variant="h3">Current Place</Typography>
                <Typography variant="h1" sx={{ mt: '0.2em' }}>
                  <AutoGraphIcon />
                  {groupMembers.findIndex(
                    (member) => member.user_id === userId
                  ) + 1}{' '}
                  / {groupMembers.length}
                </Typography>
              </>
            )}
        </Box>
        <TableContainer component={Paper} sx={{ mt: '1em' }}>
          <Table stickyHeader aria-label="group leaderboard">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell align="left">Name</TableCell>
                <TableCell align="right">Total CO2</TableCell>
                <TableCell align="right">Total Points</TableCell>
                <TableCell align="right">Weekly CO2</TableCell>
                <TableCell align="right">Weekly Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* if Global Groups tab is selected, display all groups data in table body*/}
              {selectedTab === tabs[0] &&
                filteredGroups &&
                filteredGroups.map((group, index) => (
                  <TableRow
                    key={group.group_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ color: theme.palette.secondary.main }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {group.group_name}
                    </TableCell>
                    <TableCell align="right">{group.total_co2}</TableCell>
                    <TableCell align="right">{group.total_points}</TableCell>
                    <TableCell align="right">{group.weekly_co2}</TableCell>
                    <TableCell align="right">{group.weekly_points}</TableCell>
                  </TableRow>
                ))}
              {/* if Group Members tab is selected, display all member data in table body*/}
              {selectedTab === tabs[1] &&
                filteredMembers &&
                filteredMembers.map((member, index) => (
                  <TableRow
                    key={member.user_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ color: theme.palette.secondary.main }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {member.name}
                    </TableCell>
                    <TableCell align="right">{member.total_co2}</TableCell>
                    <TableCell align="right">{member.total_points}</TableCell>
                    <TableCell align="right">{member.weekly_co2}</TableCell>
                    <TableCell align="right">{member.weekly_points}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <TablePagination
          rowsPerPageOptions={[5, 10]}
          component="div"
          count={groups.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
      </>
    );
  };

  return (
    <>
      {groups && (
        <Box sx={{ mt: '2.5em' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h2" sx={{ mb: '1em' }}>
              Leaderboard
            </Typography>
            <Tooltip title="Apply Filter">
              <IconButton onClick={handleClick}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="filter-menu"
              open={openFilterMenu}
              anchorEl={filterMenuAnchor}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              {filters.map((filter, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleFilterSelection(filter)}
                >
                  {filter.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <TabContext value={selectedTab}>
            <Box
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                width: '100%',
                display: 'flex',
                padding: '0.5em',
              }}
            >
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="Leaderboard tab options"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab label="Global Groups" value={tabs[0]} />
                <Tab label="Group Members" value={tabs[1]} />
              </Tabs>
              <TabPanel value={tabs[0]} sx={{ width: '100%' }}>
                {renderTable()}
              </TabPanel>
              <TabPanel value={tabs[1]} sx={{ width: '100%' }}>
                {renderTable()}
              </TabPanel>
            </Box>
          </TabContext>
        </Box>
      )}
    </>
  );
};

export default Leaderboard;
