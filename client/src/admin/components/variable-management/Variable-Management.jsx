// src/components/VariableControlPage.jsx

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../../axios';
import VariableTable from './components/VariableTable';
import VariableModal from './components/VariableModal';
import './variable-management.scss';

const a11yProps = (index) => {
  return {
    id: `variable-tab-${index}`,
    'aria-controls': `variable-tabpanel-${index}`,
  };
};

const VariableControlPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    variableType: '',
    item: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle Tab Change
  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle Snackbar Close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch all related data
  const {
    isLoading,
    isError,
    data: relatedData,
    error,
  } = useQuery({
    queryKey: ['variableControlData'],
    queryFn: () =>
      makeRequest.get('/admin/variables').then((res) => res.data),
  });

  if (isLoading) {
    return (
      <Box className="variable-control__loading">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="variable-control__error">
        <Typography variant="h6" color="error">
          Error: {error.message}
        </Typography>
      </Box>
    );
  }

  // Define the tabs and their respective variable types
  const tabs = [
    {
      label: 'Users',
      name: 'users',
      variableTypes: [
        'User Types',
        'Gender',
        'Status',
        'Subscription',
        'Coffee Beans',
        'Brewing Methods',
        'Coffee Types',
        'Allergies',
        'Tags',
      ],
    },
    {
      label: 'Cities',
      name: 'cities',
      variableTypes: [
        'City',
      ],
    },
    {label: 'Post',
      name: 'post',
      variableTypes: [
        'Post Category'
      ]
    },
    {
      label: 'Activity',
      name: 'activity',
      variableTypes: [
        'Activity Type',
      ],
    },
    {
      label: 'Shop Owner',
      name: 'shopowner',
      variableTypes: [
        'Job Title',
        'Subscription',
      ],
    },
    {
      label: 'Shop Listing',
      name: 'shoplisting',
      variableTypes: [
        'Shop Type',
        'Service Offered',
        'Delivery Option',
        'Day Of Week',
        'Review Category',
        'Menu Item Category',
        'Dietary Restriction',
      ],
    },
    {
      label: 'Event',
      name: 'event',
      variableTypes: [
        'Event Type',
      ],
    },
    {
      label: 'Expert',
      name: 'expert',
      variableTypes: [
        'Specialization',
        'Article Topic',
      ],
    },
    {
      label: 'Contact Us',
      name: 'contactUs',
      variableTypes: [
        'Contact Subjects',
        'Contact Subjects Options',
      ],
    },
    {
      label: 'Platform Features',
      name: 'platformFeatures',
      variableTypes: [
        'Platform Features',
        'Role Feature',
      ],
    },
    {
      label: 'Subscription',
      name: 'Subscription',
      variableTypes: [
        'Subscription',
      ],
    },
  ];

  return (
    <Box className="variable-control">
      <Typography variant="h4" gutterBottom className="variable-control__title">
        Variable Control Panel
      </Typography>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        className="variable-control__tabs"
      >
        {tabs.map((tab, index) => (
          <Tab label={tab.label} key={index} {...a11yProps(index)} />
        ))}
      </Tabs>
      {tabs.map((tab, index) => (
        <div
          role="tabpanel"
          hidden={currentTab !== index}
          id={`variable-tabpanel-${index}`}
          aria-labelledby={`variable-tab-${index}`}
          key={index}
        >
          {currentTab === index && (
            <Box className="variable-control__tabpanel">
              {tab.variableTypes.map((type, idx) => {
                const variableData = relatedData[tab.name]?.[type];
                if (!variableData) return null; // Handle undefined data

                return (
                  <Box className="variable-control__table-wrapper">
                  <VariableTable
                    key={idx}
                    category={tab.label}
                    variableType={type}
                    data={variableData.data || []}
                    properties={variableData.properties || 'full access'}
                    restriction={variableData.restriction || null}
                    setModalOpen={setModalOpen}
                    setModalConfig={setModalConfig}
                    setSnackbar={setSnackbar}
                  />
                  </Box>
                );
              })}
            </Box>
          )}
        </div>
      ))}

      {/* Variable Modal */}
      {modalOpen && (
        <VariableModal
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          modalConfig={modalConfig}
          relatedData={relatedData}
          setSnackbar={setSnackbar}
        />
      )}

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VariableControlPage;
