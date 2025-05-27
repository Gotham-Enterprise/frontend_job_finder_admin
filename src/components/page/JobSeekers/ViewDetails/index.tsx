import Image from "next/image";
import Link from "next/link";

export default function ViewDetails() {
    return (
        <>
        <div className="px-4 pt-4 pb-2">
            <Link 
                href="/admin/job-seekers"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Job Seekers
            </Link>
        </div>

        <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-6">
            <div className="col-span-full xl:col-auto">
                <div className="mb-6 rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                    <div className="flex flex-col items-center">                        {/* Profile Image */}
                        <div className="relative mb-6 inline-block">
                            <Image
                                width={120}
                                height={120}
                                src="/images/user/owner.jpeg"
                                alt="user"
                                className="rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 shadow-lg"
                            />
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 shadow-sm"></div>
                        </div>
                        
                        {/* Name and Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Liam Johnson</h2>
                            <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                Software Engineer
                            </span>
                        </div>

                        {/* Contact Information */}
                        <div className="w-full space-y-4 mb-6">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Experience</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">12 Years</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">+1212-456-7890</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white break-all">matthewsmith124@hotmail.com</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Location</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">Chicago, Illinois</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Joined</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Sep 21, 2024</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Active</span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">Mar 23, 2025</span>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="w-full">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Documents</h4>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Resume</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Johnsmith-CV.pdf</p>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 9M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Cover Letter</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Johnsmith-Cover Letter.pdf</p>
                                    </div>
                                    <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>            <div className="col-span-2 space-y-6">
                {/* Professional Background */}
                <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Professional Background</h3>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div className="flex items-center mb-2 md:mb-0">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Physical Therapist</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                    Current Position
                                </span>
                                <span className="inline-block px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                    Remote
                                </span>
                                <span className="inline-block px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-300">
                                    Full-Time
                                </span>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-2">New Care Physical Therapy</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">June 2018 - Present (6 years 2 months)</p>
                        </div>
                        
                        <div className="mb-4">
                            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Details</h6>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel diam ac velit 
                                pellentesque ultrices sit amet at ligula. Donec ultricies interdum lobortis. Curabitur 
                                ac enim bibendum, consectetur ante id, aliquet lorem. Nulla facilisi. Nam ullamcorper 
                                erat ac aliquam elementum. Quisque vel magna eget lectus sagittis bibendum.
                            </p>
                        </div>
                    </div>
                </div>

                {/* About Me */}
                <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">About Me</h3>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            I am a physical therapist dedicated to helping people regain their mobility, 
                            strength, and independence. My goal is to create personalized treatment 
                            plans tailored to each individual's needs, whether they are recovering from 
                            an injury, managing chronic pain, or overcoming physical limitations. I use a 
                            combination of exercises, manual therapy, and education to support my 
                            patients' recovery and prevent future issues. I find fulfillment in empowering 
                            others to reach their goals, improve their quality of life, and return to the activities they love. Compassion and patient-centered care are at the heart of my practice.
                        </p>
                    </div>
                </div>

                {/* Education Background */}
                <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education Background</h3>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center mb-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Bachelor of Science in Physical Therapy</h4>
                        </div>
                        <p className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Loyalty University Chicago</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">2008 - 2012</p>
                    </div>
                </div>

                {/* Licenses & Certification */}
                <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Licenses & Certification</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {/* License */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center mb-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Physical Therapy License</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Issue Date:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">June 2018</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">License Number:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">0113678000</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Certification */}
                        <div className="flex items-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Practitioner Certificate</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Practitioner Certificate.pdf</p>
                            </div>
                            <button className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Languages */}
                <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Languages</h3>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-800">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                            <span className="text-lg font-medium text-gray-900 dark:text-white">English</span>
                            <span className="ml-auto px-3 py-1 text-xs font-medium text-pink-600 bg-pink-100 rounded-full dark:bg-pink-900 dark:text-pink-300">
                                Native
                            </span>
                        </div>
                    </div>
                </div>

                {/* Skills & Expertise */}
                <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills & Expertise</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {['Manual Therapy', 'Exercise Prescription', 'Injury Assessment', 'Pain Management'].map((skill, index) => (
                                <div key={index} className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{skill}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {['Patient Education', 'Rehabilitation Planning', 'Treatment Documentation', 'Team Collaboration'].map((skill, index) => (
                                <div key={index} className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 9M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Send Message</span>
                        </button>
                        
                        <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-800 transition-colors">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Schedule Call</span>
                        </button>
                        
                        <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">View Notes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}