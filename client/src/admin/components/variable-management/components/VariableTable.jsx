// src/components/VariableTable.jsx

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
} from '@mui/material';
import { Edit, Delete, AddCircle } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../../../axios'; // Adjust the path as needed

const VariableTable = ({
  category,
  variableType,
  data,
  properties,
  restriction,
  setModalOpen,
  setModalConfig,
  setSnackbar,
}) => {
  const queryClient = useQueryClient();

  // Determine the primary key field based on variableType
  const getPrimaryKey = () => {
    const mapping = {
      'User Types': 'id',
      City: 'id',
      Gender: 'id',
      'Coffee Beans': 'bean_id',
      'Brewing Methods': 'method_id',
      'Coffee Types': 'type_id',
      Allergies: 'allergy_id',
      Tags: 'tag_id',
      ActivityType: 'id',
      ShopType: 'id',
      ServiceOffered: 'id',
      DeliveryOption: 'id',
      DayOfWeek: 'id',
      EventType: 'id',
      MenuItemCategory: 'id',
      DietaryRestriction: 'id',
      Specialization: 'id',
      contactus_subjects: 'id',
      contactus_subjects_options: 'id',
      PlatformFeatures: 'id',
    };
    return mapping[variableType] || 'id';
  };

  const primaryKey = getPrimaryKey();

  // Mutation for deleting a variable
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      makeRequest
        .delete(`/admin/variables?variableType=${encodeURIComponent(variableType)}&key=${id}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['variableControlData']);
      setSnackbar({
        open: true,
        message: `${variableType} deleted successfully.`,
        severity: 'success',
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to delete ${variableType}.`,
        severity: 'error',
      });
    },
  });

  // Handle Edit
  const handleEdit = (item) => {
    setModalConfig({
      title: `Edit ${variableType}`,
      variableType,
      item,
      restriction,
    });
    setModalOpen(true);
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete this ${variableType}?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Handle Add
  const handleAdd = () => {
    setModalConfig({
      title: `Add New ${variableType}`,
      variableType,
      item: null,
      restriction,
    });
    setModalOpen(true);
  };

  // Function to check if the column name should be hidden
  const shouldHideColumn = (columnName) => /ID|id/.test(columnName);

  // Function to check if the column is an image
  const isImageColumn = (columnName) => /img|image/i.test(columnName);

  // Function to get the image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/upload/${imagePath}`;
  };

    // Function to check if a value is an array
    const isArrayValue = (value) => Array.isArray(value);

  return (
    <Box className="variable-control__table-section">
      <Box className="variable-control__table-header">
        <Typography variant="h6" className="variable-control__table-title">
          {variableType}
        </Typography>
        {/* Show Add button only if properties allow creation */}
        {properties === 'full access' && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            className="variable-control__add-button"
            startIcon={<AddCircle />}
          >
            Add
          </Button>
        )}
      </Box>
      <Table className="variable-control__table">
        <TableHead>
          <TableRow>
            {data[0] &&
              Object.keys(data[0])
                .filter((key, index) => index === 0 || !shouldHideColumn(key)) // Hide columns except the first
                .map((key) => (
                  <TableCell key={key} className="variable-control__table-cell-head">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </TableCell>
                ))}
            <TableCell className="variable-control__table-cell-head">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item[primaryKey]} className="variable-control__table-row">
              {Object.keys(item)
                .filter((key, index) => index === 0 || !shouldHideColumn(key)) // Hide columns except the first
                .map((key) => (
                  <TableCell key={key} className="variable-control__table-cell">
                    {isImageColumn(key) ? (
                      getImageUrl(item[key]) && (
                      <img
                        src={getImageUrl(item[key])}
                        alt={key}
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                      />
                      )
                    ) : isArrayValue(item[key]) ? (
                      <ul>
                        {item[key].map((value, index) => (
                          <li key={index}>{value}</li>
                        ))}
                      </ul>
                    ) : (
                      item[key]
                    )}
                  </TableCell>
                ))}
              <TableCell className="variable-control__table-cell">
                {/* Show Edit button only if properties allow update */}
                {(properties === 'full access' || properties === 'update only') && (
                  <IconButton color="primary" onClick={() => handleEdit(item)}>
                    <Edit />
                  </IconButton>
                )}
                {/* Show Delete button only if properties allow delete */}
                {properties === 'full access' && (
                  <IconButton color="error" onClick={() => handleDelete(item[primaryKey])}>
                    <Delete />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={Object.keys(data[0] || {}).length + 1} align="center">
                No {variableType} found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default VariableTable;
