import { ResumeData, TemplateType } from '../resumeTypes';
import { MapPin, Mail, Globe, Phone } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  template: TemplateType;
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
  const { personalInfo, experience, education, skills, languages, certifications } = data;

  const renderProfessional = () => (
    <div className="w-full h-full bg-white flex flex-col font-sans text-slate-900">
      {/* Header Section */}
      <div className="flex h-48">
        <div className="w-1/3 bg-white relative flex justify-center items-center">
           <div className="w-40 h-40 rounded-full border-4 border-slate-900 overflow-hidden z-10 bg-gray-200">
            {personalInfo.profileImage ? (
              <img src={personalInfo.profileImage} alt={personalInfo.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">{personalInfo.fullName.charAt(0)}</div>
            )}
           </div>
           {/* Decorative circle part */}
           <div className="absolute top-0 left-0 w-full h-1/2 bg-white"></div>
        </div>
        <div className="w-2/3 flex flex-col justify-center pl-8 pr-8">
            <h1 className="text-5xl font-bold text-slate-900 uppercase tracking-tight">{personalInfo.fullName}</h1>
            <p className="text-2xl text-slate-700 mt-2 font-light">{personalInfo.jobTitle}</p>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-1/3 p-8 pt-4 flex flex-col gap-8">
            {personalInfo.summary && (
                <section>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 text-center">About Me</h3>
                    <p className="text-sm text-slate-600 text-center leading-relaxed">{personalInfo.summary}</p>
                </section>
            )}

            <section className="space-y-4">
                {personalInfo.phone && (
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 text-white p-2 rounded-full"><Phone size={14} /></div>
                        <span className="text-sm text-slate-700">{personalInfo.phone}</span>
                    </div>
                )}
                {personalInfo.email && (
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 text-white p-2 rounded-full"><Mail size={14} /></div>
                        <span className="text-sm text-slate-700 break-all">{personalInfo.email}</span>
                    </div>
                )}
                {personalInfo.location && (
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 text-white p-2 rounded-full"><MapPin size={14} /></div>
                        <span className="text-sm text-slate-700">{personalInfo.location}</span>
                    </div>
                )}
            </section>

            {languages && languages.length > 0 && (
                <section>
                    <h3 className="bg-slate-800 text-white py-1 px-4 text-center uppercase tracking-widest text-sm font-semibold mb-4">Language</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm pl-4">
                        {languages.map((lang, i) => <li key={i}>{lang}</li>)}
                    </ul>
                </section>
            )}

            {skills && skills.length > 0 && (
                <section>
                    <h3 className="bg-slate-800 text-white py-1 px-4 text-center uppercase tracking-widest text-sm font-semibold mb-4">Expertise</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm pl-4">
                        {skills.map((skill, i) => <li key={i}>{skill}</li>)}
                    </ul>
                </section>
            )}
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-8 pt-4 flex flex-col gap-8 border-l border-gray-200">
            {experience.length > 0 && (
                <section>
                    <h3 className="bg-slate-800 text-white py-2 px-6 text-center uppercase tracking-widest font-semibold mb-6">Experience</h3>
                    <div className="space-y-6">
                        {experience.map((exp) => (
                            <div key={exp.id}>
                                <h4 className="font-bold text-slate-900 text-lg">{exp.company}</h4>
                                <div className="text-slate-600 font-medium mb-1">{exp.position}</div>
                                <div className="text-slate-500 text-sm mb-2 font-bold">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                                <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {education.length > 0 && (
                <section>
                    <h3 className="bg-slate-800 text-white py-2 px-6 text-center uppercase tracking-widest font-semibold mb-6">Education</h3>
                    <div className="space-y-4">
                        {education.map((edu) => (
                            <div key={edu.id}>
                                <h4 className="font-bold text-slate-900">{edu.school}</h4>
                                <div className="text-slate-700">{edu.degree}</div>
                                <div className="text-slate-500 text-sm">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {/* Skills Summary / Progress Bars Simulation */}
             <section>
                <h3 className="bg-slate-800 text-white py-2 px-6 text-center uppercase tracking-widest font-semibold mb-6">Skills Summary</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                        <span>Design Process</span>
                        <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-slate-800 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm font-medium text-slate-700 mt-2">
                        <span>Project Management</span>
                        <span>81%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-slate-800 h-2.5 rounded-full" style={{ width: '81%' }}></div>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );

  const renderElegant = () => (
    <div className="w-full h-full bg-[#f5f5f0] relative overflow-hidden font-sans text-black">
      {/* Geometric Background Shapes */}
      <div className="absolute top-0 right-0 w-[60%] h-64 bg-[#e8e4dc] transform -skew-y-6 origin-top-right z-0"></div>
      <div className="absolute top-0 left-0 w-[40%] h-48 bg-[#5d4037] transform skew-y-3 origin-top-left z-0"></div>

      <div className="relative z-10 p-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
             <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 mt-8">
                {personalInfo.profileImage ? (
                  <img src={personalInfo.profileImage} alt={personalInfo.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">{personalInfo.fullName.charAt(0)}</div>
                )}
             </div>
             <div className="text-right mt-8">
                 <h1 className="text-5xl font-bold text-black uppercase tracking-widest mb-2">{personalInfo.fullName.split(' ')[0]}</h1>
                 <h1 className="text-5xl font-bold text-black uppercase tracking-widest mb-4">{personalInfo.fullName.split(' ').slice(1).join(' ')}</h1>
                 <p className="text-xl text-black uppercase tracking-[0.3em]">{personalInfo.jobTitle}</p>
             </div>
        </div>

        <div className="flex gap-12 flex-1">
            {/* Left Column */}
            <div className="w-1/3 space-y-10">
                {education.length > 0 && (
                    <section>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-6">Education</h3>
                        <div className="space-y-6">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="font-bold text-sm mb-1">{edu.startDate} - {edu.current ? 'Present' : edu.endDate} :</div>
                                    <div className="font-bold text-black">{edu.school}</div>
                                    <div className="text-sm text-gray-700">{edu.degree}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {certifications && certifications.length > 0 && (
                    <section>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-6">Award</h3>
                        <ul className="space-y-4">
                             {certifications.map((cert, i) => (
                                <li key={i} className="text-sm">
                                    <div className="font-bold text-black">2019 : Best Designer</div>
                                    <div className="text-gray-700">{cert}</div>
                                </li>
                             ))}
                        </ul>
                    </section>
                )}

                {skills.length > 0 && (
                    <section>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-6">Skills</h3>
                        <div className="space-y-3">
                            {skills.slice(0, 4).map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>{skill}</span>
                                        <span>85%</span>
                                    </div>
                                    <div className="w-full bg-[#dcd9d0] h-2 rounded-full">
                                        <div className="bg-[#8d6e63] h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/3 space-y-10">
                 {experience.length > 0 && (
                    <section>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-6">Experience</h3>
                        <div className="space-y-8">
                            {experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="font-bold text-sm mb-1">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                                    <div className="font-bold text-black text-lg">{exp.position}</div>
                                    <div className="text-sm text-gray-600 mb-2">{exp.company}</div>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>{exp.description}</li>
                                        <li>Collaborating with team members.</li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h3 className="text-xl font-bold uppercase tracking-widest text-black mb-6">Contact</h3>
                    <div className="space-y-3 text-sm font-medium">
                        {personalInfo.phone && (
                            <div className="flex items-center gap-3">
                                <div className="bg-black text-white p-1 rounded-full"><Phone size={12} /></div>
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.email && (
                            <div className="flex items-center gap-3">
                                <div className="bg-black text-white p-1 rounded-full"><Mail size={12} /></div>
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.website && (
                            <div className="flex items-center gap-3">
                                <div className="bg-black text-white p-1 rounded-full"><Globe size={12} /></div>
                                <span>{personalInfo.website}</span>
                            </div>
                        )}
                        {personalInfo.location && (
                            <div className="flex items-center gap-3">
                                <div className="bg-black text-white p-1 rounded-full"><MapPin size={12} /></div>
                                <span>{personalInfo.location}</span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
  );


  const renderBold = () => (
    <div className="w-full h-full bg-white flex font-sans text-gray-900">
      {/* Left Sidebar */}
      <div className="w-[40%] flex flex-col">
        {/* Top Orange Section */}
        <div className="bg-amber-500 p-8 flex flex-col items-center text-center h-[60%]">
            <div className="w-48 h-56 bg-gray-200 mb-8 overflow-hidden shadow-lg">
                {personalInfo.profileImage ? (
                  <img src={personalInfo.profileImage} alt={personalInfo.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">{personalInfo.fullName.charAt(0)}</div>
                )}
            </div>
            <h1 className="text-5xl font-bold text-[#451a03] mb-2 leading-tight">{personalInfo.fullName}</h1>
            <p className="text-2xl text-[#451a03] opacity-80">{personalInfo.jobTitle}</p>
        </div>
        
        {/* Bottom Brown Section */}
        <div className="bg-[#451a03] p-8 flex-1 text-white">
            <h3 className="text-2xl font-bold uppercase mb-8 border-b border-white/20 pb-2">Contact Me</h3>
            <div className="space-y-6">
                {personalInfo.location && (
                    <div className="flex items-start gap-4">
                        <div className="bg-white text-[#451a03] p-2 rounded-full mt-1"><MapPin size={16} /></div>
                        <div>
                            <p className="font-bold text-sm opacity-80">Address</p>
                            <p className="text-sm">{personalInfo.location}</p>
                        </div>
                    </div>
                )}
                {personalInfo.phone && (
                    <div className="flex items-start gap-4">
                        <div className="bg-white text-[#451a03] p-2 rounded-full mt-1"><Phone size={16} /></div>
                        <div>
                            <p className="font-bold text-sm opacity-80">Phone</p>
                            <p className="text-sm">{personalInfo.phone}</p>
                        </div>
                    </div>
                )}
                {personalInfo.website && (
                    <div className="flex items-start gap-4">
                        <div className="bg-white text-[#451a03] p-2 rounded-full mt-1"><Globe size={16} /></div>
                        <div>
                            <p className="font-bold text-sm opacity-80">Website</p>
                            <p className="text-sm break-all">{personalInfo.website}</p>
                        </div>
                    </div>
                )}
                {personalInfo.email && (
                    <div className="flex items-start gap-4">
                        <div className="bg-white text-[#451a03] p-2 rounded-full mt-1"><Mail size={16} /></div>
                        <div>
                            <p className="font-bold text-sm opacity-80">Email</p>
                            <p className="text-sm break-all">{personalInfo.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-[60%] p-10">
        <div className="bg-[#451a03] text-white py-2 px-6 text-xl font-bold uppercase mb-6 inline-block w-full">Personal Profile</div>
        <p className="text-gray-600 mb-10 leading-relaxed">
            {personalInfo.summary || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
        </p>

        <div className="bg-[#451a03] text-white py-2 px-6 text-xl font-bold uppercase mb-6 inline-block w-full">Education History</div>
        <div className="space-y-6 mb-10">
            {education.map((edu) => (
                <div key={edu.id}>
                    <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-lg text-gray-800">{edu.degree}</h4>
                        <span className="text-sm font-bold text-gray-600">({edu.startDate}-{edu.endDate})</span>
                    </div>
                    <p className="text-gray-600 mb-2">{edu.school}</p>
                    <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            ))}
        </div>

        {certifications && certifications.length > 0 && (
            <>
                <div className="bg-[#451a03] text-white py-2 px-6 text-xl font-bold uppercase mb-6 inline-block w-full">Certificate</div>
                <div className="space-y-4 mb-10">
                    {certifications.map((cert, i) => (
                        <div key={i}>
                            <h4 className="font-bold text-lg text-gray-800">{cert}</h4>
                            <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </div>
                    ))}
                </div>
            </>
        )}

        {skills.length > 0 && (
            <>
                <div className="bg-[#451a03] text-white py-2 px-6 text-xl font-bold uppercase mb-6 inline-block w-full">My Skills</div>
                <div className="grid grid-cols-2 gap-4">
                    {skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                             <span className="text-gray-800 font-medium">{skill}</span>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
  );

  const renderCreative = () => (
    <div className="w-full h-full bg-white flex text-gray-800 font-sans">
      {/* Left Sidebar */}
      <div className="w-[35%] bg-stone-100 p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-sm mb-6 bg-gray-200">
            {personalInfo.profileImage ? (
              <img 
                src={personalInfo.profileImage} 
                alt={personalInfo.fullName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-light">
                 {personalInfo.fullName.charAt(0)}
               </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide leading-tight mb-2">
            {personalInfo.fullName}
          </h1>
          <p className="text-sm text-gray-600 uppercase tracking-widest font-medium">
            {personalInfo.jobTitle}
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          {personalInfo.location && (
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><MapPin size={16} /></div>
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="flex items-center gap-3">
               <div className="w-8 flex justify-center"><Mail size={16} /></div>
              <span className="break-all">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-3">
               <div className="w-8 flex justify-center"><Globe size={16} /></div>
              <span className="break-all">{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-3">
               <div className="w-8 flex justify-center"><Phone size={16} /></div>
              <span>{personalInfo.phone}</span>
            </div>
          )}
        </div>

        {personalInfo.summary && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-2 mb-4">
              Profile
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-2 mb-4">
              Skills
            </h3>
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">{skill}</span>
                  {/* Visual dots representation - purely decorative based on index for variety */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div 
                        key={dot} 
                        className={`w-2 h-2 rounded-full ${dot <= 4 ? 'bg-gray-600' : 'bg-gray-300'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right Content */}
      <div className="w-[65%] p-10 pt-16 space-y-10">
        {experience.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-2 mb-8 inline-block min-w-[200px]">
              Work Experience
            </h3>
            <div className="space-y-8">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wide">{exp.position}</h4>
                  </div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="font-serif italic text-gray-600 text-lg">{exp.company}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-2 mb-8 inline-block min-w-[200px]">
              Education History
            </h3>
            <div className="space-y-8">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-lg">Masters in</span>
                      <span className="font-bold text-gray-900 text-lg">{edu.degree}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  <div className="font-serif italic text-gray-500 text-lg mb-2">{edu.school}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  switch (template) {
    case 'professional':
      return renderProfessional();
    case 'elegant':
      return renderElegant();
    case 'bold':
      return renderBold();
    case 'creative':
      return renderCreative();
    default:
      return renderProfessional();
  }
}
