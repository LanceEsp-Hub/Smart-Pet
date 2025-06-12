"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { submitAdoptionApplication } from '../utils/api';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdoptionApplication() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    contact_info: '',
    housing_type: 'own',
    landlord_allows_pets: null,
    household_members: [],
    pet_allergies: false,
    allergy_types: '',
    primary_caregiver: 'myself',
    expense_responsibility: 'myself',
    daily_alone_time: '<4',
    alone_time_plan: '',
    emergency_care: 'family',
    current_pets: [],
    past_pets: [],
    past_pets_outcome: '',
    adoption_reason: 'companion',
    household_agreement: true,
    household_disagreement_reason: ''
  });
  const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        setCurrentUserId(parseInt(window.sessionStorage.getItem("user_id")));
      }
    }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, value, isChecked) => {
    setFormData(prev => {
      const currentArray = [...prev[field]];
      if (isChecked) {
        currentArray.push(value);
      } else {
        const index = currentArray.indexOf(value);
        if (index > -1) {
          currentArray.splice(index, 1);
        }
      }
      return { ...prev, [field]: currentArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate user is logged in
    if (!currentUserId) {
      alert('Please log in to submit an application');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Include user_id in the submission
      const response = await submitAdoptionApplication({
        ...formData,
        user_id: currentUserId
      });
      
      alert('Application submitted successfully!');
      router.push('/profile');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>   
         <Navbar />
    <div className="container mx-auto p-4 max-w-3xl text-black">
        
        {!currentUserId && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p>Please log in to submit an adoption application.</p>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">Pet Adoption Application</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Applicant Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">1. Applicant Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 font-medium">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Phone/Email *</label>
              <input
                type="text"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Housing *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="housing_type"
                  value="own"
                  checked={formData.housing_type === 'own'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Own
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="housing_type"
                  value="rent"
                  checked={formData.housing_type === 'rent'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Rent
              </label>
            </div>
          </div>
          
          {formData.housing_type === 'rent' && (
            <div className="mb-4">
              <label className="block mb-2 font-medium">Landlord allows pets? *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="landlord_allows_pets"
                    checked={formData.landlord_allows_pets === true}
                    onChange={() => setFormData(prev => ({...prev, landlord_allows_pets: true}))}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="landlord_allows_pets"
                    checked={formData.landlord_allows_pets === false}
                    onChange={() => setFormData(prev => ({...prev, landlord_allows_pets: false}))}
                    className="mr-2"
                  />
                  No
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="landlord_allows_pets"
                    checked={formData.landlord_allows_pets === null}
                    onChange={() => setFormData(prev => ({...prev, landlord_allows_pets: null}))}
                    className="mr-2"
                  />
                  Not sure
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Household Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">2. Household Details</h2>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Who lives with you? (Select all) *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {['Live alone', 'Spouse/partner', 'Children', 'Roommates', 'Parents/relatives'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.household_members.includes(option)}
                    onChange={(e) => handleArrayChange('household_members', option, e.target.checked)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
            {formData.household_members.includes('Children') && (
              <div className="mt-2">
                <label className="block mb-1">Children's ages:</label>
                <input
                  type="text"
                  name="children_ages"
                  value={formData.children_ages || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Any pet allergies in home? *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pet_allergies"
                  checked={formData.pet_allergies === true}
                  onChange={() => setFormData(prev => ({...prev, pet_allergies: true}))}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pet_allergies"
                  checked={formData.pet_allergies === false}
                  onChange={() => setFormData(prev => ({...prev, pet_allergies: false}))}
                  className="mr-2"
                />
                No
              </label>
            </div>
            {formData.pet_allergies && (
              <div className="mt-2">
                <label className="block mb-1">Type of allergies:</label>
                <input
                  type="text"
                  name="allergy_types"
                  value={formData.allergy_types}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Pet Care Plan */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">3. Pet Care Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 font-medium">Primary caregiver *</label>
              <select
                name="primary_caregiver"
                value={formData.primary_caregiver}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="myself">Myself</option>
                <option value="spouse">Spouse/partner</option>
                <option value="family">Family member</option>
                <option value="other">Other</option>
              </select>
              {formData.primary_caregiver === 'other' && (
                <input
                  type="text"
                  name="primary_caregiver_other"
                  placeholder="Please specify"
                  className="w-full p-2 border rounded mt-2"
                />
              )}
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Who pays for pet expenses? *</label>
              <select
                name="expense_responsibility"
                value={formData.expense_responsibility}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="myself">Myself</option>
                <option value="shared">Shared responsibility</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Daily alone time *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="daily_alone_time"
                  value="<4"
                  checked={formData.daily_alone_time === '<4'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Less than 4 hours
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="daily_alone_time"
                  value="4-8"
                  checked={formData.daily_alone_time === '4-8'}
                  onChange={handleChange}
                  className="mr-2"
                />
                4-8 hours
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="daily_alone_time"
                  value=">8"
                  checked={formData.daily_alone_time === '>8'}
                  onChange={handleChange}
                  className="mr-2"
                />
                More than 8 hours
              </label>
            </div>
            {formData.daily_alone_time === '>8' && (
              <div className="mt-2">
                <label className="block mb-1">Plan for when pet is alone:</label>
                <textarea
                  name="alone_time_plan"
                  value={formData.alone_time_plan}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Vacation/emergency care *</label>
            <select
              name="emergency_care"
              value={formData.emergency_care}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="family">Family/friend</option>
              <option value="sitter">Pet sitter</option>
              <option value="boarding">Boarding facility</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Section 4: Pet Experience */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">4. Pet Experience</h2>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Current pets:</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="has_current_pets"
                  checked={formData.current_pets.length === 0}
                  onChange={() => setFormData(prev => ({...prev, current_pets: []}))}
                  className="mr-2"
                />
                None
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="has_current_pets"
                  checked={formData.current_pets.length > 0}
                  onChange={() => setFormData(prev => ({...prev, current_pets: [{}]}))}
                  className="mr-2"
                />
                Yes
              </label>
            </div>
            
            {formData.current_pets.length > 0 && (
              <div className="mt-4 space-y-4">
                {formData.current_pets.map((pet, index) => (
                  <div key={index} className="border p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Type:</label>
                        <input
                          type="text"
                          value={pet.type || ''}
                          onChange={(e) => {
                            const updatedPets = [...formData.current_pets];
                            updatedPets[index].type = e.target.value;
                            setFormData(prev => ({...prev, current_pets: updatedPets}));
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="Dog, Cat, etc."
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Spayed/neutered?</label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={pet.spayed === true}
                              onChange={() => {
                                const updatedPets = [...formData.current_pets];
                                updatedPets[index].spayed = true;
                                setFormData(prev => ({...prev, current_pets: updatedPets}));
                              }}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={pet.spayed === false}
                              onChange={() => {
                                const updatedPets = [...formData.current_pets];
                                updatedPets[index].spayed = false;
                                setFormData(prev => ({...prev, current_pets: updatedPets}));
                              }}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedPets = [...formData.current_pets];
                        updatedPets.splice(index, 1);
                        setFormData(prev => ({...prev, current_pets: updatedPets}));
                      }}
                      className="mt-2 text-red-500 text-sm"
                    >
                      Remove Pet
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, current_pets: [...prev.current_pets, {}]}))}
                  className="bg-gray-100 px-3 py-1 rounded text-sm"
                >
                  + Add Another Pet
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Past pets:</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="has_past_pets"
                  checked={formData.past_pets.length === 0}
                  onChange={() => setFormData(prev => ({...prev, past_pets: []}))}
                  className="mr-2"
                />
                None
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="has_past_pets"
                  checked={formData.past_pets.length > 0}
                  onChange={() => setFormData(prev => ({...prev, past_pets: [{}]}))}
                  className="mr-2"
                />
                Yes
              </label>
            </div>
            
            {formData.past_pets.length > 0 && (
              <div className="mt-4 space-y-4">
                {formData.past_pets.map((pet, index) => (
                  <div key={index} className="border p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Type:</label>
                        <input
                          type="text"
                          value={pet.type || ''}
                          onChange={(e) => {
                            const updatedPets = [...formData.past_pets];
                            updatedPets[index].type = e.target.value;
                            setFormData(prev => ({...prev, past_pets: updatedPets}));
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="Dog, Cat, etc."
                        />
                      </div>
                      <div>
                        <label className="block mb-1">What happened?</label>
                        <select
                          value={pet.outcome || ''}
                          onChange={(e) => {
                            const updatedPets = [...formData.past_pets];
                            updatedPets[index].outcome = e.target.value;
                            setFormData(prev => ({...prev, past_pets: updatedPets}));
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select</option>
                          <option value="passed">Passed away</option>
                          <option value="rehomed">Rehomed</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedPets = [...formData.past_pets];
                        updatedPets.splice(index, 1);
                        setFormData(prev => ({...prev, past_pets: updatedPets}));
                      }}
                      className="mt-2 text-red-500 text-sm"
                    >
                      Remove Pet
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, past_pets: [...prev.past_pets, {}]}))}
                  className="bg-gray-100 px-3 py-1 rounded text-sm"
                >
                  + Add Another Pet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Adoption Readiness */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">5. Adoption Readiness</h2>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Reason for adopting *</label>
            <select
              name="adoption_reason"
              value={formData.adoption_reason}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="companion">Companion</option>
              <option value="family">Family pet</option>
              <option value="support">Emotional support</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Everyone in household agrees? *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="household_agreement"
                  checked={formData.household_agreement === true}
                  onChange={() => setFormData(prev => ({...prev, household_agreement: true}))}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="household_agreement"
                  checked={formData.household_agreement === false}
                  onChange={() => setFormData(prev => ({...prev, household_agreement: false}))}
                  className="mr-2"
                />
                No
              </label>
            </div>
            {formData.household_agreement === false && (
              <div className="mt-2">
                <label className="block mb-1">Explain:</label>
                <textarea
                  name="household_disagreement_reason"
                  value={formData.household_disagreement_reason}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !currentUserId}
            className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 ${
                loading ? 'opacity-50' : ''
              } ${
                !currentUserId ? 'cursor-not-allowed bg-gray-400' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
        </div>
      </form>
    </div>
    <Footer />

    </div>

  );
}