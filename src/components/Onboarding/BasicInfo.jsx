import React, { useState } from 'react';
import DatePicker from '../DatePicker';

const BasicInfo = ({ userData, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    dateOfBirth: userData?.dateOfBirth || '',
    gender: userData?.gender || '',
    location: userData?.location || ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const namePattern = /^[A-Za-z0-9 ]+$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!namePattern.test(formData.firstName.trim())) {
      newErrors.firstName = 'Only letters, numbers and spaces are allowed';
    }

    // Last name is optional but if provided, validate pattern
    if (formData.lastName && !namePattern.test(formData.lastName.trim())) {
      newErrors.lastName = 'Only letters, numbers and spaces are allowed';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
  <div className="flex flex-col font-sans basic-info">

      <div className="flex flex-col justify-start items-center px-2 pb-2 max-w-[520px] w-full mx-auto relative">
        {/* Back button */}
  <button onClick={onBack} aria-label="Back" className="absolute top-[2px] left-2 bg-black/50 border border-[rgba(10,54,34,0.35)] text-primary px-2 py-1 rounded-md text-sm hover:bg-black/85 transition">
          <span className="text-base">←</span>
        </button>

        <div className="text-center mt-10 mb-3">
          <h1 className="text-white text-[1.6rem] font-bold mb-2 leading-snug">Let's get to know you</h1>
          <p className="text-[#B3B3B3] text-sm">Help us personalize your experience</p>
        </div>

        <div className="w-full flex flex-col gap-3 mb-5">
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="flex flex-col">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`bg-black border ${errors.firstName ? 'border-red-500' : 'border-[rgba(10,54,34,0.35)]'} rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,54,34,0.35)] placeholder:text-[#666] transition`}
              />
              {errors.firstName && <span className="text-red-500 text-[0.8rem] mt-1">{errors.firstName}</span>}
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name (Optional)"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`bg-black border ${errors.lastName ? 'border-red-500' : 'border-[rgba(10,54,34,0.35)]'} rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,54,34,0.35)] placeholder:text-[#666] transition`}
              />
              {errors.lastName && <span className="text-red-500 text-[0.8rem] mt-1">{errors.lastName}</span>}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-[0.8rem] font-semibold text-gray-200">Date of Birth</label>
            <DatePicker
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(val) => handleInputChange({ target: { name: 'dateOfBirth', value: val } })}
              placeholder="Date of Birth"
              inputClassName="w-full bg-black border border-[rgba(10,54,34,0.35)] rounded-xl px-4 py-3 text-white text-base placeholder:text-[#666] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,54,34,0.25)] transition"
            />
            {errors.dateOfBirth && <span className="text-red-500 text-[0.8rem] mt-1">{errors.dateOfBirth}</span>}
          </div>

            <div className="flex flex-col">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="bg-black border border-[rgba(10,54,34,0.35)] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,54,34,0.35)] transition cursor-pointer"
              >
                <option value="">Select Gender (Optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="flex flex-col">
              <input
                type="text"
                name="location"
                placeholder="Location (Optional)"
                value={formData.location}
                onChange={handleInputChange}
                className="bg-black border border-[rgba(10,54,34,0.35)] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,54,34,0.35)] placeholder:text-[#666] transition"
              />
            </div>
        </div>

        <div className="w-full mt-2">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-md text-lg font-semibold text-white"
            style={{ backgroundColor: '#0A3622' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
