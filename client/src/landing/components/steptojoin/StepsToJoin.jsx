import React, { useContext } from "react";
import { Box, Grid, Typography, Button } from '@mui/material';
import { ModalContext } from "../../../context/ModalContext.js";
import "./stepsToJoin.scss";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RedeemIcon from '@mui/icons-material/Redeem';
import EmailIcon from '@mui/icons-material/Email';

const StepsToJoin = () => {
     const { toggleRegisterModal } = useContext(ModalContext);

     return (
          <Box className="section-container">
               <Grid container direction="column" alignItems="center" spacing={3} className="stepContainer">
                    <Typography variant="h4" align="center" gutterBottom>
                         3 SIMPLE STEPS TO JOIN
                    </Typography>
                    
                    {/* Step 1 */}
                    <Grid item container xs={12} direction="column" alignItems="center" className="step">
                         <AccountCircleIcon className="icon" />
                         <Typography variant="h6" align="center">
                              Create Your Free Account
                         </Typography>
                         <Typography variant="body2" align="center">
                              Upgrade anytime to premium user for additional events and rewards!
                         </Typography>
                    </Grid>

                    <Grid item>
                         <Typography variant="h5" className="separator">+</Typography>
                    </Grid>

                    {/* Step 2 */}
                    <Grid item container xs={12} direction="column" alignItems="center" className="step">
                         <EmailIcon className="icon" />
                         <Typography variant="h6" align="center">
                              Verify Your Email to Get Started
                         </Typography>
                         <Typography variant="body2" align="center">
                              Verify your account with a quick email confirmation.
                         </Typography>
                         <Typography variant="body2" align="center">
                              This helps keep your account secure and unlocks all features.
                         </Typography>
                         <Typography variant="body2" align="center">
                              Let’s get you set up!
                         </Typography>
                         <Button variant="outlined" className="signUpButton" onClick={toggleRegisterModal}>
                              Sign Up
                         </Button>
                    </Grid>

                    <Grid item>
                         <Typography variant="h5" className="separator">+</Typography>
                    </Grid>

                    {/* Step 3 */}
                    <Grid item container xs={12} direction="column" alignItems="center" className="step">
                         <RedeemIcon className="icon" />
                         <Typography variant="h6" align="center">
                              Enjoy Rewards and Special Offers
                         </Typography>
                         <Typography variant="body2" align="center">
                              Start earning rewards with every post and review.
                         </Typography>
                         <Typography variant="body2" align="center">
                              Redeem 1-for-1 vouchers, enjoy cash rebates, and access special deals exclusive to our premium members!
                         </Typography>
                    </Grid>
               </Grid>
          </Box>
     );
};

export default StepsToJoin;
