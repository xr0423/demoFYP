import express from 'express';
import { 
     authenticateAdmin, 
     getUserStats, 
     getShopListingStats, 
     getShopListings, 
     updateShopListingStatus, 
     getUserAccounts, 
     updateUserAccountStatus, 
     getContactUsDetails, 
     getContactUsSubjects,
     getContactUsSubOptions,
     replyToContactUs,
     getAdminProfile,
     getAdminRelatedData,
     updateAdminProfile,
     getVariables,
     deleteVariables,
     updateVariable,
     addVariable,
     createContent,
     updateContent,
     getContent,
     deleteContent,

} from '../controllers/admin.js';

// getReward,
// createReward,
// updateReward,
// deleteReward,

const router = express.Router();

router.get('/profile', authenticateAdmin, getAdminProfile);
router.get('/profile/related-data', authenticateAdmin, getAdminRelatedData);
router.put('/profile', authenticateAdmin, updateAdminProfile);

router.get('/users/stats',authenticateAdmin , getUserStats);
router.get('/shoplistings/stats', authenticateAdmin , getShopListingStats);

router.get('/users/', authenticateAdmin, getUserAccounts);
router.put('/users', authenticateAdmin, updateUserAccountStatus)


router.get('/shoplistings/',authenticateAdmin,  getShopListings);
router.put('/shoplistings',authenticateAdmin, updateShopListingStatus );


router.get('/contactus/', authenticateAdmin, getContactUsDetails);
router.get('/contactus/subjects', authenticateAdmin, getContactUsSubjects);
router.get('/contactus/subjects/:target/options', authenticateAdmin, getContactUsSubOptions);

router.post('/contactus/reply/:target',authenticateAdmin, replyToContactUs);

router.get('/variables/', authenticateAdmin, getVariables);
router.delete('/variables', authenticateAdmin, deleteVariables);
router.put('/variables', authenticateAdmin, updateVariable);
router.post('/variables', authenticateAdmin, addVariable);

// landing page control
router.get('/landing', authenticateAdmin, getContent);
router.post('/landing', authenticateAdmin, createContent);
router.put('/landing/:id', authenticateAdmin, updateContent); // Use :id to specify the item to update
router.delete('/landing/:id', authenticateAdmin, deleteContent); 

// router.get('/reward', authenticateAdmin, getReward);
// router.post('/reward', authenticateAdmin, createReward)
// router.put('/reward', authenticateAdmin, updateReward);
// router.delete('/reward', authenticateAdmin, deleteReward);


export default router;