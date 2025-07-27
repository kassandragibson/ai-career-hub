import { useState } from 'react';
import { Plus, Briefcase, FileText, Search } from 'lucide-react';

// Main application component
export default function App() {
  // State to hold the list of job applications. For now, it's an empty array.
  // In the future, we'll fetch this from our Firestore database.
  const [jobs, setJobs] = useState([]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Career Hub</h1>
            <p className="text-slate-500 mt-1">Your intelligent assistant for the job search</p>
          </div>
          <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out mt-4 sm:mt-0">
            <Plus className="mr-2 h-5 w-5" />
            New Application
          </button>
        </header>

        {/* Main Content Area */}
        <main>
          <h2 className="text-2xl font-semibold mb-6 text-slate-900">My Job Applications</h2>
          
          {/* This is the main container for the list of jobs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            {/* Conditional Rendering:
              - If the 'jobs' array is empty, it shows a placeholder message.
              - Otherwise, it would show the list of jobs (we will build this part next).
            */}
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-slate-100 rounded-full h-16 w-16 flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-slate-900">No applications yet</h3>
                <p className="mt-1 text-slate-500">Click "New Application" to start tracking your job search.</p>
              </div>
            ) : (
              // This is where the list of job cards will be rendered in the future.
              <div>
                {/* We will map over the 'jobs' array here later */}
              </div>
            )}
          </div>
        </main>

        {/* Footer Section */}
        <footer className="text-center mt-12 text-sm text-slate-400">
          <p>&copy; 2025 AI Career Hub. Built with Gemini.</p>
        </footer>

      </div>
    </div>
  );
}
