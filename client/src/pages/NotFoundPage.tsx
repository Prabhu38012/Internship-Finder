import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200 mb-4">404</div>
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Search className="h-16 w-16 text-blue-600" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Link>
          <Link
            to="/jobs"
            className="block px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Help Links */}
        <div className="mt-12 text-sm text-gray-500">
          <p className="mb-4">Need help? Try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/jobs" className="text-blue-600 hover:text-blue-500">
              Browse Jobs
            </Link>
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-500">
              Dashboard
            </Link>
            <Link to="/help" className="text-blue-600 hover:text-blue-500">
              Help Center
            </Link>
            <Link to="/contact" className="text-blue-600 hover:text-blue-500">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;