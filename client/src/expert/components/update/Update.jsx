import React, { useState, useContext, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Modal, Box, Button, TextField, IconButton,
  MenuItem, Select, Checkbox, ListItemText, FormControl, 
  InputLabel, Snackbar, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../../../context/authContext';
import { makeRequest } from '../../../axios';
import './update.scss'

const Update = ({ openUpdate, setOpenUpdate, user }) => {
  const { currentUser } = useContext(AuthContext);

  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);

  const [coffeeBeans, setCoffeeBeans] = useState([]);
  const [brewingMethods, setBrewingMethods] = useState([]);
  const [coffeeTypes, setCoffeeTypes] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [tags, setTags] = useState([]);
  const [cities, setCities] = useState([]);
  const [gender, setGender] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const [alertOpen, setAlertOpen] = useState(false); // Snackbar for invalid file type
  const [alertMessage, setAlertMessage] = useState(""); // Dynamic alert message

  // Handle cover file change
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setCover(file);
    } else {
      setAlertOpen(true); // Show alert if file type is invalid
      setAlertMessage("Only .jpg and .png files are allowed for the cover picture.");
      setCover(null); // Clear the cover file state
      if (coverInputRef.current) coverInputRef.current.value = ""; // Reset the file input
    }
  };

  // Handle profile file change
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setProfile(file);
    } else {
      setAlertOpen(true); // Show alert if file type is invalid
      setAlertMessage("Only .jpg and .png files are allowed for the profile picture.");
      setProfile(null); // Clear the profile file state
      if (profileInputRef.current) profileInputRef.current.value = ""; // Reset the file input
    }
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") return; // Prevent closing if clicked outside
    setAlertOpen(false); // Close the Snackbar
  };
  

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format: yyyy-MM-dd
  };

  const [formValues, setFormValues] = useState({
    name: user.name || '',
    email: user.email || '',
    city: user.city_name || '',
    gender: user.gender || '',
    bio: user.bio || '',
    fav_beans: user.fav_beans ? user.fav_beans.split(',') : [],
    fav_brewing_methods: user.fav_brewing_methods ? user.fav_brewing_methods.split(',') : [],
    fav_coffee_type: user.fav_coffee_type ? user.fav_coffee_type.split(',') : [],
    allergies: user.allergies ? user.allergies.split(',') : [],
    tags: user.tags ? user.tags.split(',') : [],
    dob: formatDate(user.dob) || '',
    phone: user.phone || '',
    highest_education: user.highest_education || '',
    specialization: user.specialization ? user.specialization.split(',') : [],
  });

  useEffect(() => {
    const fetchUserRelatedData = async () => {
      try {
        const response = await makeRequest.get('users/related-data');
        const { coffeeBeans, brewingMethods, coffeeTypes, allergies, tags, cities, gender, specialization } = response.data;
        setCoffeeBeans(coffeeBeans);
        setBrewingMethods(brewingMethods);
        setCoffeeTypes(coffeeTypes);
        setAllergies(allergies);
        setTags(tags);
        setCities(cities);
        setGender(gender);
        setSpecializations(specialization);
      } catch (error) {
        alert('Error fetching data: ' + error.message);
      }
    };
    fetchUserRelatedData();
  }, []);

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await makeRequest.post('/upload', formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleMultiSelectChange = (field) => (event) => {
    const value = event.target.value;
    if (value.length <= 3) {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    } else {
      alert('You can select a maximum of 3 options.');
    }
  };

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (user) => makeRequest.put('/users', user),
    onSuccess: () => queryClient.invalidateQueries(['user']),
    onError: (error) => console.error('Update failed:', error),
  });

  const handleClick = async (e) => {
    e.preventDefault();

    let coverUrl = user.coverPic;
    let profileUrl = user.profilePic;

    if (cover) coverUrl = await upload(cover);
    if (profile) profileUrl = await upload(profile);

    const payload = { ...formValues, coverPic: coverUrl, profilePic: profileUrl };
    mutation.mutate(payload);
    setOpenUpdate(false);
    currentUser.profilePic = profileUrl;
  };

  return (
    <Modal open={openUpdate} onClose={() => setOpenUpdate(false)} keepMounted>
      <Box sx={{ width: 400, bgcolor: 'background.paper', p: 4, m: 'auto', mt: '10%', borderRadius: 1, maxHeight: '60vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <IconButton onClick={() => setOpenUpdate(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
  
        <Box sx={{ overflowY: 'auto', flexGrow: 1, pb: '16px' }}>
          <form>
            <div className="form-group">
              <label htmlFor="cover-upload">Upload Cover Picture (.jpg, .png) </label>
              <input
                type="file"
                id="cover-upload"
                accept=".jpg, .jpeg, .png" // Restrict file types shown in the file picker
                ref={coverInputRef} // Attach ref here
                onChange={handleCoverChange} // Call validation function on change
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-upload">Upload Profile Picture (.jpg, .png) </label>
              <input
                type="file"
                id="profile-upload"
                accept=".jpg, .jpeg, .png" // Restrict file types shown in the file picker
                ref={profileInputRef} // Attach ref here
                onChange={handleProfileChange} // Call validation function on change
              />
            </div>

            <Snackbar 
              open={alertOpen} 
              autoHideDuration={3000} 
              onClose={handleCloseAlert} // Use handleCloseAlert here
            >
              <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                {alertMessage}
              </Alert>
            </Snackbar>
  
            <TextField
              label="Name"
              name="name"
              value={formValues.name}
              onChange={(e) => {
                if (e.target.value.length <= 20) {  // Limit to 20 characters
                  setFormValues({ ...formValues, name: e.target.value });
                }
              }}
              fullWidth
              margin="normal"
              helperText={`${formValues.name.length} / 20 characters`} // Display character count
            />

            <TextField
              label="Email"
              name="email"
              value={formValues.email}
              onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
              fullWidth
              margin="normal"
              style={{ display: "none" }}
            />
  
            <TextField
              label="Highest Education"
              name="highest_education"
              value={formValues.highest_education}
              onChange={(e) => {
                if (e.target.value.length <= 100) { // Limit to 100 characters
                  setFormValues({ ...formValues, highest_education: e.target.value });
                }
              }}
              fullWidth
              margin="normal"
              helperText={`${formValues.highest_education.length} / 100 characters`} // Display character count
            />

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                id="gender-select"
                value={formValues.gender}
                onChange={(e) => setFormValues({ ...formValues, gender: e.target.value })}
                label="Gender"
              >
                {gender.map((g) => (
                  <MenuItem key={g.id} value={g.gender_name}>
                    {g.gender_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="city-label">City</InputLabel>
              <Select
                labelId="city-label"
                value={formValues.city}
                onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
                label="City"
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.city_name}>
                    {city.city_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <TextField
              label="Date of Birth"
              type="date"
              name="dob"
              value={formValues.dob}
              onChange={(e) => setFormValues({ ...formValues, dob: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
  
            <TextField
              label="Bio"
              name="bio"
              value={formValues.bio}
              onChange={(e) => {
                if (e.target.value.length <= 200) { // Limit to 200 characters
                  setFormValues({ ...formValues, bio: e.target.value });
                }
              }}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              helperText={`${formValues.bio.length} / 200 characters`} // Display character count
            />

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="fav-beans-label">Favorite Coffee Beans</InputLabel>
              <Select
                labelId="fav-beans-label"
                multiple
                value={formValues.fav_beans}
                onChange={handleMultiSelectChange('fav_beans')}
                renderValue={(selected) => selected.join(', ')}
                label="Favorite Coffee Beans"
              >
                {coffeeBeans.map((bean) => (
                  <MenuItem key={bean.bean_id} value={bean.bean_name}>
                    <Checkbox checked={formValues.fav_beans.includes(bean.bean_name)} />
                    <ListItemText primary={bean.bean_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="specializations-label">Specializations</InputLabel>
              <Select
                labelId="specializations-label"
                multiple
                value={formValues.specialization}
                onChange={handleMultiSelectChange('specialization')}
                renderValue={(selected) => selected.join(', ')}
                label="Specializations"
              >
                {specializations.map((s) => (
                  <MenuItem key={s.id} value={s.specialization_name}>
                    <Checkbox checked={formValues.specialization.includes(s.specialization_name)} />
                    <ListItemText primary={s.specialization_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="fav-brewing-label">Favorite Brewing Methods</InputLabel>
              <Select
                labelId="fav-brewing-label"
                multiple
                value={formValues.fav_brewing_methods}
                onChange={handleMultiSelectChange('fav_brewing_methods')}
                renderValue={(selected) => selected.join(', ')}
                label="Favorite Brewing Methods"
              >
                {brewingMethods.map((method) => (
                  <MenuItem key={method.method_id} value={method.method_name}>
                    <Checkbox checked={formValues.fav_brewing_methods.includes(method.method_name)} />
                    <ListItemText primary={method.method_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="fav-coffee-label">Favorite Coffee Types</InputLabel>
              <Select
                labelId="fav-coffee-label"
                multiple
                value={formValues.fav_coffee_type}
                onChange={handleMultiSelectChange('fav_coffee_type')}
                renderValue={(selected) => selected.join(', ')}
                label="Favorite Coffee Types"
              >
                {coffeeTypes.map((type) => (
                  <MenuItem key={type.type_id} value={type.type_name}>
                    <Checkbox checked={formValues.fav_coffee_type.includes(type.type_name)} />
                    <ListItemText primary={type.type_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="allergies-label">Allergies</InputLabel>
              <Select
                labelId="allergies-label"
                multiple
                value={formValues.allergies}
                onChange={handleMultiSelectChange('allergies')}
                renderValue={(selected) => selected.join(', ')}
                label="Allergies"
              >
                {allergies.map((allergy) => (
                  <MenuItem key={allergy.allergy_id} value={allergy.allergy_name}>
                    <Checkbox checked={formValues.allergies.includes(allergy.allergy_name)} />
                    <ListItemText primary={allergy.allergy_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="tags-label">Tags</InputLabel>
              <Select
                labelId="tags-label"
                multiple
                value={formValues.tags}
                onChange={handleMultiSelectChange('tags')}
                renderValue={(selected) => selected.join(', ')}
                label="Tags"
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.tag_id} value={tag.tag_name}>
                    <Checkbox checked={formValues.tags.includes(tag.tag_name)} />
                    <ListItemText primary={tag.tag_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        </Box>
  
        <Box sx={{ pt: 2, borderTop: '1px solid #ddd' }}>
          <Button variant="contained" onClick={handleClick} fullWidth
              sx={{
                backgroundColor: "#6b4605", // Custom background color
                color: "#FFFFFF", // Text color
                '&:hover': {
                  backgroundColor: "#312b23", // Hover color
                }
              }}>
            Update
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Update;
