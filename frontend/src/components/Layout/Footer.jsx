import React from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Linkedin, Twitter, Github, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">InternQuest</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connect with top companies and find amazing internship opportunities. Build your career with us.
            </p>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Students</h3>
            <div className="flex flex-col gap-2">
              <Link to="/internships" className="text-gray-400 hover:text-white text-sm transition-colors">
                Browse Internships
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-white text-sm transition-colors">
                Create Account
              </Link>
              <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          {/* For Companies */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Companies</h3>
            <div className="flex flex-col gap-2">
              <Link to="/register" className="text-gray-400 hover:text-white text-sm transition-colors">
                Post Internships
              </Link>
              <Link to="/company" className="text-gray-400 hover:text-white text-sm transition-colors">
                Company Dashboard
              </Link>
              <Link to="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <div className="flex flex-col gap-2">
              <Link to="/help" className="text-gray-400 hover:text-white text-sm transition-colors">
                Help Center
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact Us
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 InternQuest. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
