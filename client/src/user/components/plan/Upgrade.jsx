import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Switch,
  Grid,
} from '@mui/material';
import { makeRequest } from '../../../axios';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ConstructionIcon from '@mui/icons-material/Construction';
import { AuthContext } from '../../../context/authContext';


const UpgradePlanModal = ({ open, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const {currentUser} = useContext(AuthContext);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await makeRequest.get('users/plan');
        setPlans(response.data);
        setLoading(false);
  
        // Automatically select the plan based on currentUser.subscriptionId
        const defaultPlan =
          response.data.find((plan) => plan.id === currentUser.subscriptionId) || '';
        setSelectedPlan(defaultPlan.id);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setLoading(false);
      }
    };
  
    if (open) {
      fetchPlans();
    }
  }, [open, currentUser.subscriptionId]);
  

  const handlePlanChange = (event) => {
    setSelectedPlan(event.target.value);
  };

  const handleUpgrade = async () => {
    console.log('Selected Plan:', selectedPlan);
    // Add your upgrade logic here
    await makeRequest.post(`users/plan/upgrade?plan=${selectedPlan}`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 700,
          bgcolor: '#f6f3f3',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" sx={{ color: '#522427', marginBottom: '1rem' }}>
          SUBSCRIPTION PLAN
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '1rem', color: '#522427' }}>
          Start for free now and upgrade when Business Ready. Use our plans to kickstart your Business.
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : plans.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <ConstructionIcon sx={{ fontSize: 50, color: '#6b4605', mb: 1 }} />
            <HourglassEmptyIcon sx={{ fontSize: 40, color: '#e1c7ad', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#6b4605', fontWeight: 'bold' }}>
              Coming Soon!
            </Typography>
            <Typography variant="body2" sx={{ color: '#522427', mt: 1 }}>
              We are working hard to bring you the best plans. Stay tuned!
            </Typography>
          </Box>
        ) : (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup value={selectedPlan} onChange={handlePlanChange}>
              <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                {plans.map((plan) => (
                  <Grid item xs={12} md={4} key={plan.id}>
                    <Box
                      onClick={() => setSelectedPlan(plan.id)}
                      sx={{
                        backgroundColor: selectedPlan === plan.id ? '#e1c7ad' : '#f5ebe1',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        textAlign: 'left',
                        transition: 'transform 0.3s',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <FormControlLabel
                        value={plan.id}
                        control={<Radio sx={{ display: 'none' }} />} // Hides the Radio button
                        label=""
                      />
                      <Typography variant="h6" sx={{ color: '#6b4605', fontWeight: 'bold' }}>
                        {plan.subscription_name}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ color: '#522427', fontWeight: 'bold', margin: '0.5rem 0' }}
                      >
                        ${plan.price}/month
                      </Typography>
                      {Array.isArray(plan.features) && plan.features.length > 0 ? (
                        plan.features.map((feature, index) => (
                          <Typography key={index} variant="body2" sx={{ color: '#6b4605' }}>
                            {feature}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#6b4605' }}>
                          No features available.
                        </Typography>
                      )}

                    </Box>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </FormControl>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: '#522427' }}>
            Cancel
          </Button>
          {selectedPlan !== currentUser.subscriptionId && (
            <Button
              variant="contained"
              onClick={handleUpgrade}
              disabled={!selectedPlan}
              sx={{
                backgroundColor: '#6b4605',
                color: '#f6f3f3',
                '&:hover': {
                  backgroundColor: '#522427',
                },
              }}
            >
              Change plan
            </Button>
          )}
        </Box>

      </Box>
    </Modal>
  );
};

export default UpgradePlanModal;
