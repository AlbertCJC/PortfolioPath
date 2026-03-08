# PortfolioPath

PortfolioPath is an AI-powered platform designed to help developers turn their code into career opportunities. By analyzing your GitHub repositories, it provides detailed code audits, generates resume-ready bullet points, and creates personalized learning paths to help you grow as a developer.

## Features

- **Code Analyzer**: 
  - Connect your GitHub account to analyze repositories.
  - Get a comprehensive audit report including quality scores, tech stack identification, strengths, and weaknesses.
  - Receive actionable refactoring suggestions to improve your code.

- **Resume Generator**:
  - Automatically generate professional resume bullet points based on your code analysis.
  - Create and edit your resume with a built-in editor.
  - Export your resume to PDF.

- **Growth Tracking**:
  - Track your code quality scores over time.
  - Visualize your skill growth across Frontend, Backend, DevOps, Security, Design, and Architecture.
  - View your analysis history and revisit past reports.

- **Learning Path**:
  - Get a personalized roadmap tailored to your coding style and industry trends.
  - Focus on specific areas for improvement with curated resources.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, Recharts, Lucide React
- **Backend**: Node.js, Express
- **AI Integration**: Google Gemini API (@google/genai)
- **Database**: MongoDB (for user data persistence)
- **Authentication**: GitHub OAuth

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- Google Gemini API Key
- GitHub OAuth App credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/portfoliopath.git
   cd portfoliopath
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
