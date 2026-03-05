import React, { useState } from 'react';
import { ResumeData } from '../resumeTypes';
import { Plus, Trash2, Save, Edit, Sparkles } from 'lucide-react';

interface ResumeFormProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
  onAutoFill?: () => void;
}

export default function ResumeForm({ data, updateData, onAutoFill }: ResumeFormProps) {
  const [isLocked, setIsLocked] = useState(false);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [name]: value,
      },
    });
  };

  const addExperience = () => {
    updateData({
      ...data,
      experience: [
        ...data.experience,
        {
          id: crypto.randomUUID(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        },
      ],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    updateData({
      ...data,
      experience: data.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    updateData({
      ...data,
      experience: data.experience.filter((exp) => exp.id !== id),
    });
  };

  const addEducation = () => {
    updateData({
      ...data,
      education: [
        ...data.education,
        {
          id: crypto.randomUUID(),
          school: '',
          degree: '',
          startDate: '',
          endDate: '',
          current: false,
        },
      ],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    updateData({
      ...data,
      education: data.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    updateData({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skills = e.target.value.split(',').map((s) => s.trim());
    updateData({
      ...data,
      skills,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({
          ...data,
          personalInfo: {
            ...data.personalInfo,
            profileImage: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = "w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white placeholder-slate-500";
  const labelClass = "bg-slate-800/50 p-4 font-medium text-slate-300 flex items-center text-sm border-r border-slate-800";
  const sectionHeaderClass = "bg-slate-800 p-4 border-y border-slate-700 flex justify-between items-center";
  const sectionTitleClass = "font-bold text-slate-200 uppercase tracking-wide text-sm";

  return (
    <div className="bg-[#131825] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#131825]">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isLocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isLocked ? 'Locked' : 'Editing'}
          </span>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            isLocked
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
          }`}
        >
          {isLocked ? (
            <>
              <Edit size={16} /> Edit Resume
            </>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>
      <fieldset disabled={isLocked} className="min-w-0 w-full border-0 p-0 m-0 disabled:opacity-70">
      {/* Personal Information Section */}
      <div className={sectionHeaderClass}>
        <h2 className={sectionTitleClass}>Personal Information</h2>
      </div>
      
      <div className="divide-y divide-slate-800">
          {/* Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={labelClass}>
              Full Name
            </div>
            <div className="p-2">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={data.personalInfo.fullName}
                onChange={handlePersonalInfoChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={labelClass}>
              Job Title
            </div>
            <div className="p-2">
              <input
                type="text"
                name="jobTitle"
                placeholder="Job Title"
                value={data.personalInfo.jobTitle}
                onChange={handlePersonalInfoChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Profile Image */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={labelClass}>
              Profile Image
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                {data.personalInfo.profileImage && (
                  <div className="relative w-16 h-16 shrink-0">
                    <img 
                      src={data.personalInfo.profileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover border border-slate-700"
                    />
                    <button
                      onClick={() => updateData({
                        ...data,
                        personalInfo: { ...data.personalInfo, profileImage: '' }
                      })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-500/10 file:text-emerald-400
                      hover:file:bg-emerald-500/20
                      cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-slate-500">Upload a photo (JPG, PNG)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={labelClass}>
              Email
            </div>
            <div className="p-2">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={data.personalInfo.email}
                onChange={handlePersonalInfoChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={labelClass}>
              Phone
            </div>
            <div className="p-2">
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={data.personalInfo.phone}
                onChange={handlePersonalInfoChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={labelClass}>
              Location
            </div>
            <div className="p-2">
              <input
                type="text"
                name="location"
                placeholder="Location (City, Country)"
                value={data.personalInfo.location}
                onChange={handlePersonalInfoChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Website */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={labelClass}>
              Website
            </div>
            <div className="p-2">
              <input
                type="url"
                name="website"
                placeholder="Website / LinkedIn"
                value={data.personalInfo.website}
                onChange={handlePersonalInfoChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <div className={`${labelClass} items-start pt-4`}>
              Professional Summary
            </div>
            <div className="p-2">
              <textarea
                name="summary"
                placeholder="Professional Summary"
                value={data.personalInfo.summary}
                onChange={handlePersonalInfoChange}
                className={`${inputClass} min-h-[100px]`}
              />
            </div>
          </div>
      </div>


      {/* Experience Section */}
      <div className={`${sectionHeaderClass} mt-0`}>
        <h2 className={sectionTitleClass}>Experience</h2>
        <button
          onClick={addExperience}
          className="flex items-center gap-1 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={14} /> ADD POSITION
        </button>
      </div>

      <div className="divide-y divide-slate-800">
        {data.experience.map((exp, index) => (
          <div key={exp.id} className="group">
            <div className="bg-slate-800/30 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
               <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Position #{index + 1}</span>
               <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="Remove Experience"
                >
                  <Trash2 size={14} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-slate-800 last:border-b-0">
              <div className={`${labelClass} pl-8`}>Company</div>
              <div className="p-2">
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    className={inputClass}
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-slate-800 last:border-b-0">
              <div className={`${labelClass} pl-8`}>Position</div>
              <div className="p-2">
                  <input
                    type="text"
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    className={inputClass}
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-slate-800 last:border-b-0">
              <div className={`${labelClass} pl-8`}>Duration</div>
              <div className="p-2 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    className={inputClass}
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="text"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    disabled={exp.current}
                    className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-slate-800 last:border-b-0">
              <div className={`${labelClass} pl-8`}>Current Role</div>
              <div className="p-2 flex items-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <span>I currently work here</span>
                  </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
              <div className={`${labelClass} items-start pt-3 pl-8`}>Description</div>
              <div className="p-2">
                  <textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    className={`${inputClass} min-h-[80px]`}
                  />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className={sectionHeaderClass}>
        <h2 className={sectionTitleClass}>Education</h2>
        <button
          onClick={addEducation}
          className="flex items-center gap-1 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={14} /> ADD EDUCATION
        </button>
      </div>

      <div className="divide-y divide-slate-800">
        {data.education.map((edu, index) => (
          <div key={edu.id} className="group">
             <div className="bg-slate-800/30 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
               <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Education #{index + 1}</span>
               <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="Remove Education"
                >
                  <Trash2 size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-slate-800 last:border-b-0">
              <div className={`${labelClass} pl-8`}>School</div>
              <div className="p-2">
                  <input
                    type="text"
                    placeholder="School / University"
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                    className={inputClass}
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-slate-800 last:border-b-0">
              <div className={`${labelClass} pl-8`}>Degree</div>
              <div className="p-2">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    className={inputClass}
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-slate-800 last:border-b-0">
              <div className={`${labelClass} pl-8`}>Duration</div>
              <div className="p-2 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Start Date"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    className={inputClass}
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="text"
                    placeholder="End Date"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    disabled={edu.current}
                    className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
              <div className={`${labelClass} pl-8`}>Current</div>
              <div className="p-2 flex items-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <span>I currently study here</span>
                  </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Section */}
      <div className={sectionHeaderClass}>
        <h2 className={sectionTitleClass}>Skills</h2>
        {onAutoFill && (
          <button
            onClick={onAutoFill}
            className="flex items-center gap-1 text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
            title="Auto-fill skills from your analysis and repositories"
          >
            <Sparkles size={14} /> AUTO FILL
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        <div className={`${labelClass} items-start pt-4`}>
          Skills List
        </div>
        <div className="p-2">
          <textarea
            placeholder="Enter skills separated by commas (e.g. JavaScript, React, Project Management)"
            value={data.skills.join(', ')}
            onChange={handleSkillsChange}
            className={`${inputClass} min-h-[100px]`}
          />
        </div>
      </div>

      {/* Languages Section */}
      <div className={sectionHeaderClass}>
        <h2 className={sectionTitleClass}>Languages</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        <div className={`${labelClass} items-start pt-4`}>
          Languages List
        </div>
        <div className="p-2">
          <textarea
            placeholder="Enter languages separated by commas (e.g. English, Spanish, French)"
            value={data.languages ? data.languages.join(', ') : ''}
            onChange={(e) => updateData({ ...data, languages: e.target.value.split(',').map(s => s.trim()) })}
            className={`${inputClass} min-h-[80px]`}
          />
        </div>
      </div>

      {/* Certifications Section */}
      <div className={sectionHeaderClass}>
        <h2 className={sectionTitleClass}>Certifications</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        <div className={`${labelClass} items-start pt-4`}>
          Certifications List
        </div>
        <div className="p-2">
          <textarea
            placeholder="Enter certifications separated by commas"
            value={data.certifications ? data.certifications.join(', ') : ''}
            onChange={(e) => updateData({ ...data, certifications: e.target.value.split(',').map(s => s.trim()) })}
            className={`${inputClass} min-h-[80px]`}
          />
        </div>
      </div>
      </fieldset>
    </div>
  );
}
