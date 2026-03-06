export interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    cityState: string;
    country: string;
    website: string;
    summary: string;
    jobTitle: string;
    profileImage?: string;
    fullName?: string; // For backward compatibility
    location?: string; // For backward compatibility
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: string[];
  certifications: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export type TemplateType = 'professional' | 'elegant' | 'bold' | 'creative';

export const initialResumeData: ResumeData = {
  personalInfo: {
    firstName: 'Richard',
    lastName: 'Sanchez',
    email: 'hello@reallygreatsite.com',
    phone: '+123-456-7890',
    address: '123 Anywhere St.',
    cityState: 'Any City, ST',
    country: 'United States',
    website: 'www.reallygreatsite.com',
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet quam rhoncus, egestas dui eget, malesuada justo. Ut aliquam augue.',
    jobTitle: 'Product Designer',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  experience: [
    {
      id: '1',
      company: 'Studio Showde',
      position: 'Senior Designer',
      startDate: '2020',
      endDate: '2022',
      current: false,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet quam rhoncus, egestas dui eget, malesuada justo. Ut aliquam augue.',
    },
    {
      id: '2',
      company: 'Elsetown Cor.',
      position: 'Graphic Designer',
      startDate: '2016',
      endDate: '2020',
      current: false,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet quam rhoncus, egestas dui eget, malesuada justo. Ut aliquam augue.',
    }
  ],
  education: [
    {
      id: '1',
      school: 'Borcelle University',
      degree: 'Bachelor of Business Management',
      startDate: '2014',
      endDate: '2023',
      current: false,
    },
    {
      id: '2',
      school: 'Borcelle University',
      degree: 'Master of Business Management',
      startDate: '2014',
      endDate: '2018',
      current: false,
    }
  ],
  skills: ['Management Skills', 'Creativity', 'Digital Marketing', 'Negotiation', 'Critical Thinking', 'Leadership'],
  languages: ['English', 'German (Basic)', 'Spanish (Basic)'],
  certifications: ['Certified Product Manager (2023)', 'UX Design Professional (2022)'],
};
