import React, { useState, useEffect } from 'react';
import { makeRequest } from '../../../axios';
import './contactUs.scss';

const ContactUsForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    option: '', // This field captures the selected option
    message: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const relatedData = await makeRequest.get('/feedback/related-data');
        setSubjects(relatedData.data);
      } catch (error) {
        console.error('Error fetching types', error);
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.subject) errors.subject = 'Subject is required';
    if (!formData.message) errors.message = 'Message is required';
    if (subjectOptions && !formData.option) {
      errors.option = 'Please select an inquiry or feedback type';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length === 0) {
      setFormErrors({});
      try {
        // Sending form data to backend, including the selected inquiry type
        const response = await makeRequest.post('/feedback', {
          ...formData,
        });
        console.log(response.data);
        setIsSubmitted(true);
      } catch (err) {
        console.log(err);
      }
    } else {
      setFormErrors(errors);
      setIsSubmitted(false);
    }
  };

  // Get the selected subject object
  const selectedSubject = subjects.find(
    (subject) => subject.subject_name === formData.subject
  );

  // Get the options for the selected subject
  const subjectOptions = selectedSubject?.subOption
    ? selectedSubject.subOption.split(',')
    : null;

  return (
    <div className="modal-backdrop" id="contact-us">
      <div className="modal-content">
        <h2>Contact Us</h2>
        {isSubmitted ? 
          <div>
            <p>Thank you for contacting us! We'll get back to you soon.</p>
            <button type="button" className="close-button" onClick={onClose}>
              Close
            </button>
          </div>
        : 
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && <p style={{ color: 'red' }}>{formErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && <p style={{ color: 'red' }}>{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_name}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
              {formErrors.subject && <p style={{ color: 'red' }}>{formErrors.subject}</p>}
            </div>

            {/* Show options only if the selected subject has options */}
            {subjectOptions && (
              <div>
                <label htmlFor="option">Option</label>
                <select
                  id="option"
                  name="option" // Use inquiryType to capture the selected option
                  value={formData.option}
                  onChange={handleChange}
                >
                  <option value="">Select Option</option>
                  {subjectOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {formErrors.option && <p style={{ color: 'red' }}>{formErrors.option}</p>}
              </div>
            )}

            <div>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              {formErrors.message && <p style={{ color: 'red' }}>{formErrors.message}</p>}
            </div>

            <div className="button-group">
              <button type="submit" className='Submit-button' onClick={handleSubmit}>Submit</button>
              <button type="button" className="close-button" onClick={onClose}>
                Close
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  );
};

export default ContactUsForm;
