'use client';

import React, { useEffect } from 'react';
import Head from 'next/head'; // Import Head for managing head elements

// Corrected HTML content provided by the user
const aboutPageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us | iSPEAK Language Learning Program</title>
    <!-- Tailwind CDN is generally not recommended for Next.js, but keeping as per provided HTML -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <!-- Corrected Favicon Path -->
    <link rel="icon" href="/iSPEAK Favicon.png" type="image/png">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2B2D42;
            --secondary: #6EC5B8;
            --accent: #FFD93D;
            --coral: #FF8C61;
            --light-blue: #E0F7FA;
            --cream: #FAF9F6;
        }
        body { font-family: 'Poppins', sans-serif; color: var(--primary); overflow-x: hidden; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Montserrat', sans-serif; }
        .btn-primary { background-color: var(--accent); color: var(--primary); font-weight: 600; transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); background-color: #FFCE00; }
        .btn-secondary { background-color: var(--secondary); color: white; font-weight: 600; transition: all 0.3s ease; }
        .btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); background-color: #5DB1A5; }
        /* Corrected Hero Pattern Path */
        .hero-pattern { background-image: url('/iSPEAK Background.jpg'); background-size: cover; background-position: center; }
        .dropdown { position: relative; display: inline-block; }
        .dropdown-content { display: none; position: absolute; background-color: white; min-width: 200px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1); z-index: 1; border-radius: 4px; top: 100%; left: 0; }
        .dropdown:hover .dropdown-content { display: block; }
        .nav-link { transition: all 0.3s ease; position: relative; }
        .nav-link:after { content: ''; position: absolute; width: 0; height: 2px; background-color: var(--accent); bottom: -2px; left: 0; transition: width 0.3s ease; }
        .nav-link:hover:after { width: 100%; }
        .active-nav:after { width: 100%; }
        .value-card { transition: all 0.3s ease; border-radius: 12px; overflow: hidden; height: 100%; }
        .value-card:hover { transform: translateY(-5px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .pillar-card { transition: all 0.3s ease; }
        .pillar-card:hover { transform: scale(1.02); }
        .testimonial-card { transition: all 0.3s ease; height: 100%; }
        .testimonial-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .language-card { transition: all 0.3s ease; overflow: hidden; height: 100%; }
        .language-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .step-card { transition: all 0.3s ease; height: 100%; }
        .step-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.08); }
        .faq-item { transition: all 0.3s ease; }
        .faq-item:hover { background-color: #f8f9fa; }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
        .faq-item.active .faq-answer { max-height: 500px; }
        .faq-item.active .faq-icon { transform: rotate(180deg); }
        .mobile-menu { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: white; z-index: 50; padding: 20px; overflow-y: auto; }
        .mobile-menu.active { display: block; }
        @media (max-width: 768px) { .desktop-nav { display: none; } .mobile-nav-btn { display: block; } }
        .rounded-image { border-radius: 12px; }
        .accent-border-yellow { border-bottom: 4px solid var(--accent); }
        .accent-border-teal { border-bottom: 4px solid var(--secondary); }
        .accent-border-blue { border-bottom: 4px solid #3B82F6; }
        .accent-border-coral { border-bottom: 4px solid var(--coral); }
        .checkered-bg { background-color: var(--light-blue); background-image: linear-gradient(45deg, #e0f7fa 25%, transparent 25%), linear-gradient(-45deg, #e0f7fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0f7fa 75%), linear-gradient(-45deg, transparent 75%, #e0f7fa 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .float-animation { animation: float 4s ease-in-out infinite; }
        .social-icon { transition: all 0.3s ease; }
        .social-icon:hover { transform: scale(1.2); }
        .video-container { border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); position: relative; padding-bottom: 100%; height: 0; }
        .video-container video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
        .mobile-dropdown-content { transition: all 0.3s ease; overflow: hidden; }
        @media (max-width: 768px) { .nav-link, .dropdown, .faq-question, .btn-primary, .btn-secondary { cursor: pointer; -webkit-tap-highlight-color: transparent; } .value-card, .language-card, .testimonial-card, .step-card { transform: none !important; } .value-card:hover, .language-card:hover, .testimonial-card:hover, .step-card:hover { transform: none !important; } }
        .fade-in { animation: fadeIn 0.5s ease-in forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) { .footer-links { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; } }
        .about-section { scroll-margin-top: 100px; }
        .about-image { border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
        .philosophy-card { border-radius: 12px; transition: all 0.3s ease; height: 100%; }
        .philosophy-card:hover { transform: translateY(-5px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .tab-button { position: relative; transition: all 0.3s ease; }
        .tab-button.active { background-color: var(--accent); color: var(--primary); font-weight: 600; }
        .tab-button:after { content: ''; position: absolute; width: 0; height: 3px; background-color: var(--accent); bottom: -3px; left: 0; transition: width 0.3s ease; }
        .tab-button.active:after { width: 100%; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
    </style>
</head>
<body>
    <!-- Top Bar -->
    <div class="bg-gray-100 py-2 px-4 hidden md:block">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <div class="flex items-center">
                    <i class="fas fa-phone-alt text-sm mr-2 text-teal-600"></i>
                    <span class="text-sm">+1 (478) 390-4040</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-envelope text-sm mr-2 text-teal-600"></i>
                    <span class="text-sm">info@ispeaklanguage.org</span>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <a href="#" class="social-icon text-gray-600 hover:text-blue-600"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="social-icon text-gray-600 hover:text-pink-600"><i class="fab fa-instagram"></i></a>
                <a href="#" class="social-icon text-gray-600 hover:text-blue-400"><i class="fab fa-twitter"></i></a>
            </div>
        </div>
    </div>

    <!-- Main Navigation -->
    <nav class="bg-white py-4 shadow-md sticky top-0 z-40">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <!-- Corrected Logo Path -->
            <a href="/" class="flex items-center">
                <img src="/ISPEAK.png" alt="iSPEAK Logo" class="h-10 md:h-14">
            </a>
            
            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-6 desktop-nav">
                <!-- Corrected Home Link -->
                <a href="/" class="nav-link font-medium">Home</a>
                
                <div class="dropdown">
                    <a href="/about" class="nav-link active-nav font-medium flex items-center font-bold text-teal-600">
                        About Us
                        <i class="fas fa-chevron-down ml-1 text-xs"></i>
                    </a>
                    <div class="dropdown-content py-2">
                        <a href="#what-is-ispeak" class="block px-4 py-2 hover:bg-gray-100">What is iSPEAK?</a>
                        <a href="#our-mission" class="block px-4 py-2 hover:bg-gray-100">Our Mission</a>
                        <a href="#ispeak-method" class="block px-4 py-2 hover:bg-gray-100">The iSPEAK Method</a>
                        <a href="#educational-philosophy" class="block px-4 py-2 hover:bg-gray-100">Educational Philosophy</a>
                    </div>
                </div>
                
                <div class="dropdown">
                    <a href="#" class="nav-link font-medium flex items-center">
                        Plans & Pricing
                        <i class="fas fa-chevron-down ml-1 text-xs"></i>
                    </a>
                    <div class="dropdown-content py-2">
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Yoruba Programs</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Kiswahili Programs</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Twi Programs</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Amharic Programs (Coming Soon)</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Group Rates</a>
                    </div>
                </div>
                
                <a href="#" class="nav-link font-medium">Paji Shop</a>
                <a href="#" class="nav-link font-medium">Loyalty Program</a>
                
                <div class="dropdown">
                    <a href="#" class="nav-link font-medium flex items-center">
                        Resources
                        <i class="fas fa-chevron-down ml-1 text-xs"></i>
                    </a>
                    <div class="dropdown-content py-2">
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Free Resources</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Learning Articles</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Cultural Information</a>
                    </div>
                </div>
                
                <a href="#" class="nav-link font-medium">Contact Us</a>
            </div>
            
            <div class="hidden md:block">
                <div class="dropdown">
                    <button class="btn-primary px-6 py-2 rounded-md flex items-center">
                        Login / Register
                        <i class="fas fa-chevron-down ml-1 text-xs"></i>
                    </button>
                    <div class="dropdown-content py-2 right-0 left-auto">
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Parent/Student Login</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Educator Login</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Register</a>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Navigation Button -->
            <button class="md:hidden mobile-nav-btn" id="mobileMenuBtn" aria-label="Open menu">
                <i class="fas fa-bars text-2xl"></i>
            </button>
        </div>
    </nav>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="flex justify-between items-center mb-6">
            <!-- Corrected Mobile Logo Path -->
            <img src="/ISPEAK.png" alt="iSPEAK Logo" class="h-12">
            <button id="mobileMenuCloseBtn" aria-label="Close menu">
                <i class="fas fa-times text-2xl"></i>
            </button>
        </div>
        
        <div class="space-y-4">
            <!-- Corrected Mobile Home Link -->
            <a href="/" class="block py-2 border-b border-gray-200">Home</a>
            
            <div class="mobile-dropdown">
                <div class="flex justify-between items-center py-2 border-b border-gray-200 mobile-dropdown-toggle font-bold text-teal-600">
                    <span>About Us</span>
                    <i class="fas fa-chevron-down text-sm"></i>
                </div>
                <div class="mobile-dropdown-content pl-4 py-2 space-y-2">
                    <a href="#what-is-ispeak" class="block py-1">What is iSPEAK?</a>
                    <a href="#our-mission" class="block py-1">Our Mission</a>
                    <a href="#ispeak-method" class="block py-1">The iSPEAK Method</a>
                    <a href="#educational-philosophy" class="block py-1">Educational Philosophy</a>
                </div>
            </div>
            
            <div class="mobile-dropdown">
                <div class="flex justify-between items-center py-2 border-b border-gray-200 mobile-dropdown-toggle">
                    <span>Plans & Pricing</span>
                    <i class="fas fa-chevron-down text-sm"></i>
                </div>
                <div class="mobile-dropdown-content hidden pl-4 py-2 space-y-2">
                    <a href="#" class="block py-1">Yoruba Programs</a>
                    <a href="#" class="block py-1">Kiswahili Programs</a>
                    <a href="#" class="block py-1">Twi Programs</a>
                    <a href="#" class="block py-1">Amharic Programs (Coming Soon)</a>
                    <a href="#" class="block py-1">Group Rates</a>
                </div>
            </div>
            
            <a href="#" class="block py-2 border-b border-gray-200">Paji Shop</a>
            <a href="#" class="block py-2 border-b border-gray-200">Loyalty Program</a>
            
            <div class="mobile-dropdown">
                <div class="flex justify-between items-center py-2 border-b border-gray-200 mobile-dropdown-toggle">
                    <span>Resources</span>
                    <i class="fas fa-chevron-down text-sm"></i>
                </div>
                <div class="mobile-dropdown-content hidden pl-4 py-2 space-y-2">
                    <a href="#" class="block py-1">Free Resources</a>
                    <a href="#" class="block py-1">Learning Articles</a>
                    <a href="#" class="block py-1">Cultural Information</a>
                </div>
            </div>
            
            <a href="#" class="block py-2 border-b border-gray-200">Contact Us</a>
            
            <div class="pt-4 space-y-3">
                <a href="#" class="block py-2 px-4 bg-yellow-300 text-center rounded-md font-medium">Login</a>
                <a href="#" class="block py-2 px-4 bg-teal-500 text-white text-center rounded-md font-medium">Register</a>
            </div>
        </div>
    </div>
    
    <!-- Page Header -->
    <section class="hero-pattern relative">
        <div class="absolute inset-0 bg-primary bg-opacity-50"></div>
        <div class="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div class="text-center text-white">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
                <p class="text-xl max-w-3xl mx-auto">Discover how iSPEAK is preserving African languages and connecting children to their heritage through engaging online lessons.</p>
            </div>
        </div>
    </section>
    
    <!-- Page Navigation -->
    <section class="bg-white py-4 shadow-md sticky top-16 z-30">
        <div class="container mx-auto px-4">
            <div class="flex flex-wrap justify-center gap-2 md:gap-4">
                <a href="#what-is-ispeak" class="tab-button px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm md:text-base">What is iSPEAK?</a>
                <a href="#our-mission" class="tab-button px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm md:text-base">Our Mission</a>
                <a href="#ispeak-method" class="tab-button px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm md:text-base">The iSPEAK Method</a>
                <a href="#educational-philosophy" class="tab-button px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm md:text-base">Educational Philosophy</a>
            </div>
        </div>
    </section>
    
    <!-- What is iSPEAK? Section -->
    <section id="what-is-ispeak" class="py-12 md:py-16 bg-white about-section">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                    <h2 class="text-3xl md:text-4xl font-bold mb-4 text-primary">What is iSPEAK?</h2>
                    <p class="text-lg text-gray-700 mb-6">iSPEAK is the first language program that focuses on introducing young learners (and their families) to indigenous languages through live online lessons with indigenous speakers! Founded with a vision to preserve cultural heritage, iSPEAK connects children ages 3-14 with certified native speakers for interactive, engaging language lessons that build both skills and cultural pride.</p>
                    
                    <p class="text-lg text-gray-700 mb-6">Unlike generic language apps or pre-recorded courses, iSPEAK provides real human connection through one-on-one and small group sessions tailored to each child's learning style, age, and cultural background. Our child-centred approach ensures that language learning becomes a joyful journey rather than a mundane task.</p>
                    
                    <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-teal-500 mb-6">
                        <h3 class="text-xl font-bold mb-3">Who iSPEAK Serves</h3>
                        <p class="mb-3">Our program is specifically designed for:</p>
                        <ul class="space-y-2">
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-teal-500 mt-1 mr-3"></i>
                                <span>Children aged 3-14 years from diverse backgrounds</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-teal-500 mt-1 mr-3"></i>
                                <span>Heritage learners reconnecting with their family languages</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-teal-500 mt-1 mr-3"></i>
                                <span>Parents seeking to raise multilingual children with cultural awareness</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-teal-500 mt-1 mr-3"></i>
                                <span>Homeschool families looking for quality language instruction</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-teal-500 mt-1 mr-3"></i>
                                <span>Anyone wishing to preserve indigenous African languages for future generations</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div class="order-first lg:order-last mb-6 lg:mb-0">
                    <div class="relative">
                        <!-- Corrected Educator Image Path -->
                        <img src="/iSPEAK landscape images/Smiling_person_in_colorful_shirt.jpg" alt="iSPEAK educator" class="about-image w-full h-auto">
                        <div class="absolute -bottom-6 -right-6 z-10 float-animation hidden md:block">
                            <!-- Corrected Mascot Image Path -->
                            <img src="/iSPEAK Favicon.png" alt="Paji mascot" class="w-16 h-16 md:w-24 md:h-24">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-12 md:mt-16">
                <h3 class="text-2xl font-bold mb-4">Our Program Components</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div class="text-teal-500 text-4xl mb-4"> <i class="fas fa-video"></i> </div>
                        <h4 class="text-xl font-bold mb-2">Live Interactive Lessons</h4>
                        <p class="text-gray-700">One-on-one sessions with native speakers tailored to each child's age, learning style, and cultural background.</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div class="text-yellow-500 text-4xl mb-4"> <i class="fas fa-book"></i> </div>
                        <h4 class="text-xl font-bold mb-2">Cultural Materials</h4>
                        <p class="text-gray-700">Authentic learning resources that provide language in context, including stories, songs, and cultural traditions.</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div class="text-red-400 text-4xl mb-4"> <i class="fas fa-chart-line"></i> </div>
                        <h4 class="text-xl font-bold mb-2">Progress Tracking</h4>
                        <p class="text-gray-700">Comprehensive assessment that focuses on encouraging growth rather than creating test anxiety.</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div class="text-blue-500 text-4xl mb-4"> <i class="fas fa-child"></i> </div>
                        <h4 class="text-xl font-bold mb-2">Customized Pacing</h4>
                        <p class="text-gray-700">Lessons that move at your child's speed, respecting their learning rhythm and developmental needs.</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div class="text-purple-500 text-4xl mb-4"> <i class="fas fa-globe-africa"></i> </div>
                        <h4 class="text-xl font-bold mb-2">Cultural Context</h4>
                        <p class="text-gray-700">Language learning embedded in rich cultural experiences that build connection and identity.</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div class="text-green-500 text-4xl mb-4"> <i class="fas fa-users"></i> </div>
                        <h4 class="text-xl font-bold mb-2">Family Resources</h4>
                        <p class="text-gray-700">Support materials for parents to continue language practice between sessions, regardless of their own proficiency.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Current Languages Section -->
    <section class="py-12 md:py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold mb-6 text-center">What We Do</h2>
            <p class="text-lg text-gray-700 mb-8 text-center max-w-4xl mx-auto">iSPEAK is a Language Program designed to expand and preserve indigenous languages across the world. Presently, iSPEAK offers live Twi, Yoruba and Kiswahili language lessons to children between the ages of 3 years and 14 years. Currently, we are building our library to include Igbo, Hausa, Ewe, and Amharic.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div class="bg-white rounded-lg overflow-hidden shadow-md">
                    <div class="h-32 bg-blue-500 flex items-center justify-center"><h3 class="text-3xl text-white font-bold">Twi</h3></div>
                    <div class="p-6"><p class="text-gray-700 mb-4">A member of the Akan language family and one of the principal languages of Ghana, Twi is spoken by over 9 million people. Our Twi program introduces children to both everyday conversation and cultural context, helping them connect with Ghanaian heritage and traditions.</p><div class="flex items-center"><span class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">9+ million speakers</span></div></div>
                </div>
                <div class="bg-white rounded-lg overflow-hidden shadow-md">
                    <div class="h-32 bg-yellow-500 flex items-center justify-center"><h3 class="text-3xl text-white font-bold">Yoruba</h3></div>
                    <div class="p-6"><p class="text-gray-700 mb-4">With over 40 million speakers primarily in Nigeria, Benin, and Togo, Yoruba is one of West Africa's most widely spoken languages. Our Yoruba program helps children master this tonal language while exploring the rich cultural traditions, proverbs, and stories of the Yoruba people.</p><div class="flex items-center"><span class="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">40+ million speakers</span></div></div>
                </div>
                <div class="bg-white rounded-lg overflow-hidden shadow-md">
                    <div class="h-32 bg-teal-500 flex items-center justify-center"><h3 class="text-3xl text-white font-bold">Kiswahili</h3></div>
                    <div class="p-6"><p class="text-gray-700 mb-4">As a lingua franca throughout East Africa, Kiswahili connects diverse communities across Kenya, Tanzania, Uganda, and beyond. Our Kiswahili program emphasises practical communication skills alongside cultural understanding, helping children connect with this influential language and its vibrant cultural heritage.</p><div class="flex items-center"><span class="text-sm bg-teal-100 text-teal-800 px-3 py-1 rounded-full">100+ million speakers</span></div></div>
                </div>
            </div>
            <div class="bg-white p-6 md:p-8 rounded-lg shadow-md">
                <h3 class="text-2xl font-bold mb-4">Coming Soon to iSPEAK</h3>
                <p class="text-gray-700 mb-6">We are actively developing programs for these important African languages:</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-purple-50 p-4 rounded-lg"><h4 class="font-bold text-lg mb-2">Amharic</h4><p class="text-gray-700">The official language of Ethiopia with over 25 million speakers, featuring a unique script and rich literary tradition.</p></div>
                    <div class="bg-green-50 p-4 rounded-lg"><h4 class="font-bold text-lg mb-2">Igbo</h4><p class="text-gray-700">One of Nigeria's major languages with approximately 24 million speakers, known for its tonality and cultural significance.</p></div>
                    <div class="bg-red-50 p-4 rounded-lg"><h4 class="font-bold text-lg mb-2">Hausa</h4><p class="text-gray-700">Spoken by over 70 million people across West Africa, Hausa serves as an important trade language with a rich history.</p></div>
                    <div class="bg-blue-50 p-4 rounded-lg"><h4 class="font-bold text-lg mb-2">Ewe</h4><p class="text-gray-700">An important language of Ghana and Togo with approximately 7 million speakers, featuring distinctive tonal patterns.</p></div>
                </div>
                <div class="mt-6 text-center">
                    <p class="mb-4">If you're interested in being notified when these languages become available, please join our waiting list.</p>
                    <div class="flex flex-col sm:flex-row justify-center">
                        <input type="email" placeholder="Your email address" class="px-4 py-2 border border-gray-300 rounded-l-md rounded-r-md sm:rounded-r-none mb-2 sm:mb-0 w-full sm:w-auto">
                        <button class="btn-primary px-6 py-2 rounded-md sm:rounded-l-none font-medium">Join Waitlist</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Our Mission Section -->
    <section id="our-mission" class="py-12 md:py-16 bg-white about-section">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                    <!-- Corrected Family Image Path -->
                    <img src="/iSPEAK landscape images/Family_celebrating_Kwanzaa_Umoja.jpg" alt="Family celebrating cultural traditions" class="about-image w-full h-auto rounded-lg shadow-xl">
                </div>
                <div>
                    <h2 class="text-3xl md:text-4xl font-bold mb-4 text-primary">Our Mission</h2>
                    <p class="text-lg text-gray-700 mb-6">Our mission as educators is to preserve the languages of the world. More than 255 languages in Africa are on the verge of extinction and it's our job to stop that! Funds raised through iSPEAK are put towards preserving language. As we expand, iSPEAK will not only help preserve the endangered languages of Africa, but we also have goals to be a part of preservation of First Americans (North and South), First Australians, Hawaiians, and other Pacific Languages.</p>
                    <div class="space-y-6 mt-6">
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-yellow-500"><h3 class="text-xl font-bold mb-2">Preserving Linguistic Heritage</h3><p class="text-gray-700">Every language contains unique ways of seeing and understanding the world. When a language disappears, we lose not just words, but entire perspectives, wisdom traditions, and cultural knowledge. At iSPEAK, we believe that language preservation is an urgent priority that benefits everyone – not just heritage speakers.</p></div>
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-teal-500"><h3 class="text-xl font-bold mb-2">Building Cultural Bridges</h3><p class="text-gray-700">iSPEAK Language Learning Program also has the mission of connecting the African Diaspora to their lost cultures through experiencing connections with indigenous languages and the people who speak them. This is a PanAfrican effort to unify the indigenous people of the planet to improve our state of existence wherever we find ourselves on the globe.</p></div>
                        <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500"><h3 class="text-xl font-bold mb-2">Our Larger Impact</h3><p class="text-gray-700">iSPEAK's efforts will also support employment, self-empowerment, and the building of global communities through the modernization of languages, (re)establishing and preservation of written language and engagement of indigenous individuals in professional development to become the ambassadors for their indigenous languages.</p></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Statistics Banner -->
    <section class="checkered-bg py-10">
        <div class="container mx-auto px-4">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="text-2xl md:text-3xl font-bold mb-6">Why Language Preservation Matters</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                    <div class="bg-white p-4 rounded-lg shadow-md"><div class="text-yellow-500 text-4xl mb-3"><i class="fas fa-language"></i></div><h3 class="text-2xl font-bold">7,000+</h3><p class="text-gray-600">Languages worldwide</p></div>
                    <div class="bg-white p-4 rounded-lg shadow-md"><div class="text-red-500 text-4xl mb-3"><i class="fas fa-exclamation-triangle"></i></div><h3 class="text-2xl font-bold">40%</h3><p class="text-gray-600">At risk of extinction</p></div>
                    <div class="bg-white p-4 rounded-lg shadow-md"><div class="text-purple-500 text-4xl mb-3"><i class="fas fa-map-marked-alt"></i></div><h3 class="text-2xl font-bold">255+</h3><p class="text-gray-600">African languages endangered</p></div>
                    <div class="bg-white p-4 rounded-lg shadow-md"><div class="text-green-500 text-4xl mb-3"><i class="fas fa-child"></i></div><h3 class="text-2xl font-bold">5 years</h3><p class="text-gray-600">Critical age for language acquisition</p></div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- iSPEAK Method Section -->
    <section id="ispeak-method" class="py-12 md:py-16 bg-white about-section">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold mb-6 text-center">The iSPEAK Method</h2>
            <p class="text-lg text-gray-700 mb-8 text-center max-w-4xl mx-auto">The iSPEAK methodology centres around three essential language skills, presented in a natural, developmentally appropriate sequence. Each lesson provides carefully balanced attention to listening, speaking, and reading, creating a comprehensive language learning experience.</p>
            <div class="flex justify-center mb-10">
                <!-- Corrected 3 Pillars Image Path -->
                <img src="/iSPEAK landscape images/Birds_on_trees_listening_speaking_reading.jpg" alt="iSPEAK Three-Pillar Method" class="rounded-lg shadow-lg max-w-full md:max-w-3xl">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div class="bg-yellow-50 p-6 rounded-lg shadow-md relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-24 h-24 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 80c-123.5 0-223.5 78.95-223.5 176.5S132.5 432 256 432s223.5-77.25 223.5-175.5S379.5 80 256 80zm0 224a47.5 47.5 0 1 1 0-95 47.5 47.5 0 1 1 0 95zm147.7-193.3c-13.1-9.8-27.7-18.2-43.6-25-20.1-8.6-41.6-15.2-63.1-16.1v32.6c13.1 .8 31.6 5.9 52.5 14.7 11.3 4.9 24.9 11.6 34.1 17.5 14.7 9.4 24.9 20.3 24.9 20.3l21.8-22.3c-4.9-4-12.1-11.9-26.6-21.7z"/></svg></div>
                    <div class="relative z-10"><div class="text-yellow-600 text-4xl mb-4"><i class="fas fa-ear-listen"></i></div><h3 class="text-xl font-bold mb-3">Listening Skills</h3><p class="text-gray-700 mb-4">Each lesson provides opportunities for learners to hear the language. Learners will be expected to listen and repeat the language to develop the needed skills to hear and begin to comprehend meanings of spoken words and phrases.</p><p class="text-gray-700">Children first learn to recognise sounds, tones, and patterns unique to their target language. Through stories, songs, and guided activities, they develop the ear for the language – just as they naturally learned their first language. This receptive phase builds the foundation for all other language skills.</p></div>
                </div>
                <div class="bg-red-50 p-6 rounded-lg shadow-md relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-24 h-24 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm34.9 291.9c-46.5 0-76.2-32.2-76.2-74.5s29.7-74.5 76.2-74.5c20.2 0 37.4 7.1 50.7 21l-20.5 19.8c-8.6-8.6-19.8-13.2-30.2-13.2-25.3 0-43.6 17.6-43.6 46.9S265.8 310 291.1 310c15.8 0 26.8-4.9 33.8-8.2v-21.8h-29.7v-26.8h58.4v64.9c-14.8 10.9-34.9 16-62.7 16z"/></svg></div>
                    <div class="relative z-10"><div class="text-red-600 text-4xl mb-4"><i class="fas fa-comments"></i></div><h3 class="text-xl font-bold mb-3">Speaking Skills</h3><p class="text-gray-700 mb-4">iSPEAK lessons include several opportunities to use the language independently. Early lessons require reciting language using appropriate imitation of the teacher. Later lessons will allow students to increase vocabulary and develop sentences with appropriate grammar.</p><p class="text-gray-700">Our supportive educators create a comfortable environment where children can practice speaking without fear of mistakes. Through structured conversations, role-playing, and interactive games, learners gradually build confidence in expressing themselves.</p></div>
                </div>
                <div class="bg-green-50 p-6 rounded-lg shadow-md relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-24 h-24 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm40 304H216c-13.3 0-24-10.7-24-24V184c0-13.3 10.7-24 24-24h80c13.3 0 24 10.7 24 24v144c0 13.3-10.7 24-24 24z"/></svg></div>
                    <div class="relative z-10"><div class="text-green-600 text-4xl mb-4"><i class="fas fa-book-open"></i></div><h3 class="text-xl font-bold mb-3">Reading Skills</h3><p class="text-gray-700 mb-4">iSPEAK language program is focused on speaking and conversational use of the learner's target language. However, later lessons include focus on specific grammar, tonal and spelling rules that improve reading and writing as well.</p><p class="text-gray-700">As learners progress, we introduce written elements of the language – from basic alphabet recognition to simple texts. For languages with unique scripts, we provide specialised materials to make learning accessible and engaging. This integrated approach ensures children develop well-rounded language proficiency.</p></div>
                </div>
            </div>
            <div class="mt-12 text-center"><a href="#" class="btn-primary px-6 py-3 rounded-md inline-block text-lg">Learn More About Our Classes</a></div>
        </div>
    </section>
    
    <!-- Educational Philosophy Section -->
    <section id="educational-philosophy" class="py-12 md:py-16 bg-gray-50 about-section">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold mb-3 text-center">Educational Philosophy</h2>
            <p class="text-lg text-gray-700 mb-8 text-center max-w-4xl mx-auto">Our approach to language education is grounded in research-based methodologies that honor each child's natural learning process while celebrating cultural heritage.</p>
            <div class="mb-8">
                <div class="flex flex-wrap justify-center gap-2 md:gap-4 mb-6">
                    <button id="tab1-btn" class="tab-button active px-4 py-2 rounded-md text-sm md:text-base">The Silent Period</button>
                    <button id="tab2-btn" class="tab-button px-4 py-2 rounded-md text-sm md:text-base">Heritage Language Learning</button>
                    <button id="tab3-btn" class="tab-button px-4 py-2 rounded-md text-sm md:text-base">Language Proficiency Levels</button>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <div id="tab1" class="tab-content active">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div>
                                <h3 class="text-2xl font-bold mb-4">Understanding the Silent Period</h3>
                                <p class="text-gray-700 mb-5">Adults (Teachers/Parents) must be aware of the possibility of encountering learners who go through a silent period, a period of time in which the language learner does not orally produce language.</p>
                                <div class="bg-yellow-50 p-6 rounded-lg mb-6">
                                    <h4 class="font-bold text-lg mb-3">The Silent Period is:</h4>
                                    <ul class="space-y-2">
                                        <li class="flex items-start"><i class="fas fa-check-circle text-yellow-600 mt-1 mr-3"></i><span>Common in children learning a second language</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-yellow-600 mt-1 mr-3"></i><span>Especially prevalent among very young learners (VYLs), typically children between the ages of three and seven</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-yellow-600 mt-1 mr-3"></i><span>Occurs at times with young learners (YLs) who may be in early primary school, but for a shorter period of time</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-yellow-600 mt-1 mr-3"></i><span>A phase where learners aren't doing much talking yet</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-yellow-600 mt-1 mr-3"></i><span>May last between 2 to 6 months or longer, depending on the exposure to the foreign language that the learner has, her level of shyness, confidence, and cultural influences</span></li>
                                    </ul>
                                </div>
                                <h4 class="font-bold text-xl mb-3">What's Really Happening During the Silent Period</h4>
                                <p class="text-gray-700 mb-5">Can result when a learner is actively processing the language mentally and are actually learning. Can be recognised when eye movements, physical actions, etc. indicate the child is mentally processing or has understood. Don't worry. The Silent Period doesn't stop the teachers from encouraging language production using patience, friendliness, and fun. iSPEAK lessons allow the learners to take production steps when they are ready.</p>
                                <h4 class="font-bold text-xl mb-3">Supporting Your Child Through the Silent Period</h4>
                                <p class="text-gray-700">You can help your child get through the silent period by remembering to stay patient, schedule frequent classes (at least twice weekly), practice what the child has learned outside of iSPEAK classrooms, encourage your child to listen, think, and repeat what the teacher says during classes. The silent period is a natural part of language acquisition. With the right support and understanding, children naturally progress to speaking when they feel ready and confident.</p>
                            </div>
                            <div>
                                <!-- Corrected Certificate Image Path -->
                                <img src="/iSPEAK landscape images/Child_holding_a_certificate.jpg" alt="Child learning language" class="about-image w-full h-auto rounded-lg shadow-md mb-6">
                                <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                                    <h4 class="font-bold text-lg mb-2">Expert Insight</h4>
                                    <p class="text-gray-700 mb-4">Language acquisition experts recognize that the silent period is a normal, often necessary phase in language development. During this time, children are building receptive vocabulary and internalizing language patterns even when they're not yet producing speech.</p>
                                    <p class="text-gray-700">Research shows that forced speech production during this period can actually increase anxiety and slow down long-term language development. Our educators are trained to recognize and respect this phase while providing gentle encouragement and opportunities for participation when the child is ready.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tab2" class="tab-content hidden">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div>
                                <h3 class="text-2xl font-bold mb-4">Heritage Language Learner</h3>
                                <p class="text-gray-700 mb-5">You may wonder, 'What is Heritage Language?' when it comes to language learning in young children. The name of this concept may seem self-explanatory. However, the impact of Heritage Learning is less understood and subsequently, less valued that many may fully comprehend.</p>
                                <h4 class="font-bold text-xl mb-3">What is a Heritage Language?</h4>
                                <p class="text-gray-700 mb-5">Heritage language is a term given to the language spoken in a family home, often the first language of parents or grandparents, and is often being used in a community where another language is more widely used. For example, in the United States or the UK, English language learners are often from households that speak Spanish or Chinese as the heritage language. In the past, heritage language learners were discouraged from using the heritage language in public and families often limited its use when speaking to their young children in an effort to blend into a larger community.</p>
                                <h4 class="font-bold text-xl mb-3">Unique Characteristics of Heritage Learners</h4>
                                <p class="text-gray-700 mb-5">Despite the diversity of their skill levels, heritage learners all share certain characteristics. First, they are bilingual (or multilingual), and few, if any, bilinguals are equally competent in two languages in all areas. While the learner may do well formulating sentences in their heritage language, they may lack reading comprehension or the ability to follow complex instruction given in the family's indigenous or heritage language. Conversely, the child may read well in the community's common language but integrate heritage language terms to replace vocabulary they are missing instead of learning the necessary vocabulary. The notion of a 'balanced' bilingual is a popular myth based primarily on theory rather than fact. Although they are not equally fluent in both languages, heritage learners do use two language systems, or at least parts of two language systems.</p>
                                <h4 class="font-bold text-xl mb-3">Understanding Language Shift</h4>
                                <p class="text-gray-700 mb-5">Their language reflects an ongoing process of intergenerational language shift from the heritage language to the language of the country of immigration. How language shift is manifested—and which skills are reduced and how—depends on factors including age and education level at immigration, family background, parental profession, and religion. Additionally, families from communities with negative historical ties to the dominant culture face unique challenges as they encounter cultural preservation. The stylisation, intonation, and contextual usage available to the educated native speaker will differ from that of the language learner who acquires simple words, phrases, or grammar through familial instruction.</p>
                            </div>
                            <div>
                                <!-- Corrected Storytelling Image Path -->
                                <img src="/iSPEAK landscape images/Elderly_woman_storytelling_to_children.jpg" alt="Intergenerational knowledge sharing" class="about-image w-full h-auto rounded-lg shadow-md mb-6">
                                <div class="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500 mb-6">
                                    <h4 class="font-bold text-lg mb-2">Why Heritage Language Learning Matters</h4>
                                    <p class="text-gray-700">What does this mean for your child? If you spoke Yoruba or Kiswahili as a child, for example, but no longer use the language at home as your children grow up, significant parts of the language may be missing from your child's vocabulary and usage. The child may lack a full grasp of expressions and cultural nuances used when speaking with grandparents or extended family. Regular classes with iSPEAK are beneficial to encourage daily language use, build a broader vocabulary than what might be used at home, and foster a complete understanding of the language's cultural context and correct usage.</p>
                                </div>
                                <div class="bg-green-50 p-6 rounded-lg">
                                    <h4 class="font-bold text-lg mb-3">Benefits of Heritage Language Learning</h4>
                                    <ul class="space-y-2">
                                        <li class="flex items-start"><i class="fas fa-check-circle text-green-600 mt-1 mr-3"></i><span>Stronger family connections and communication with extended family</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-green-600 mt-1 mr-3"></i><span>Enhanced cognitive benefits of bilingualism</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-green-600 mt-1 mr-3"></i><span>Deeper connection to cultural heritage and identity</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-green-600 mt-1 mr-3"></i><span>Preservation of endangered indigenous knowledge</span></li>
                                        <li class="flex items-start"><i class="fas fa-check-circle text-green-600 mt-1 mr-3"></i><span>Greater future opportunities for global connection</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tab3" class="tab-content hidden">
                        <h3 class="text-2xl font-bold mb-6">Language Proficiency Levels</h3>
                        <p class="text-gray-700 mb-6">At iSPEAK, we recognise that language learning is a journey with distinct stages. Understanding where your child is on this journey allows us to tailor instruction and set appropriate goals. Our proficiency framework provides a clear path from first words to confident fluency.</p>
                        <div class="overflow-x-auto mb-8">
                            <table class="min-w-full bg-white border border-gray-200">
                                <thead><tr><th class="py-3 px-4 bg-gray-100 text-left">Proficiency Level</th><th class="py-3 px-4 bg-gray-100 text-left">Description</th><th class="py-3 px-4 bg-gray-100 text-left">Typical Skills</th></tr></thead>
                                <tbody>
                                    <tr class="border-t border-gray-200"><td class="py-3 px-4 font-medium">Early Beginner</td><td class="py-3 px-4">Has no prior knowledge of the language. Is learning word sounds and vocabulary.</td><td class="py-3 px-4">Does not construct complete sentences, yet. Can recognize and respond to basic greetings.</td></tr>
                                    <tr class="border-t border-gray-200 bg-gray-50"><td class="py-3 px-4 font-medium">Beginner</td><td class="py-3 px-4">Is learning to use the language. May have some prior knowledge.</td><td class="py-3 px-4">Uses deductive reasoning to connect language to concepts and vocabulary. Forms basic phrases.</td></tr>
                                    <tr class="border-t border-gray-200"><td class="py-3 px-4 font-medium">New Speaker</td><td class="py-3 px-4">Has limited prior knowledge. Uses vocabulary for one-word answers or very elementary sentences.</td><td class="py-3 px-4">Connects terms to ideas effectively. Can respond to basic questions with short phrases.</td></tr>
                                    <tr class="border-t border-gray-200 bg-gray-50"><td class="py-3 px-4 font-medium">Intermediate</td><td class="py-3 px-4">Uses at least 1000 terms in the target language.</td><td class="py-3 px-4">Understands and follows simple directions while making appropriate connections. Can engage in basic conversations.</td></tr>
                                    <tr class="border-t border-gray-200"><td class="py-3 px-4 font-medium">Semi-Fluent</td><td class="py-3 px-4">Can construct complete sentences and follow multi-step directions.</td><td class="py-3 px-4">Is beginning to read the language and has a basic understanding of tones (if applicable). Can express needs and preferences.</td></tr>
                                    <tr class="border-t border-gray-200 bg-gray-50"><td class="py-3 px-4 font-medium">Fluent Speaker</td><td class="py-3 px-4">Can hold conversation by appropriately using vocabulary and understanding language spoken at a moderate speed.</td><td class="py-3 px-4">Draws meaning from connected words. Can discuss a variety of topics with reasonable fluency.</td></tr>
                                    <tr class="border-t border-gray-200"><td class="py-3 px-4 font-medium">Mastery</td><td class="py-3 px-4">Can hold conversation using an expanded vocabulary.</td><td class="py-3 px-4">Speaks with fewer than a 25% error rate in vocabulary, pronunciation, and spelling. Reads and writes with a similar error margin.</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="bg-teal-50 p-6 rounded-lg"><h4 class="font-bold text-lg mb-3">How We Measure Progress</h4><p class="text-gray-700">Our educators use gentle, encouraging assessment methods to determine your child's current proficiency level and track their growth. Instead of formal tests, we observe language use during lessons to note how comfortably and accurately children understand and produce the language. Each level represents meaningful progress that is celebrated as a milestone. While the pace of advancement varies based on age, previous exposure, and lesson frequency, our structured approach ensures steady language development.</p></div>
                            <div class="bg-blue-50 p-6 rounded-lg"><h4 class="font-bold text-lg mb-3">Ready to Begin Your Child's Language Journey?</h4><p class="text-gray-700 mb-4">Whether your child is starting from zero or already has some exposure to their heritage language, iSPEAK educators will meet them at their current level and guide their progress through each proficiency stage.</p><div class="text-center"><a href="#" class="btn-primary px-6 py-2 rounded-md inline-block">Register Now</a></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Testimonial Section -->
    <section class="py-12 md:py-16 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold mb-3 text-center">What Parents Say</h2>
            <p class="text-lg text-gray-700 mb-8 text-center max-w-3xl mx-auto">Hear from families who have experienced the impact of iSPEAK's unique approach to language learning.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div class="bg-gray-50 p-6 rounded-lg shadow-md"><div class="flex text-yellow-400 mb-3"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p class="text-gray-700 italic mb-4">"What I appreciate most about iSPEAK is their approach to teaching. They understand that children learn differently than adults. The way they incorporate games, songs, and cultural stories makes my daughter excited for every lesson!"</p><div class="flex items-center"><div class="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center mr-3"><span class="text-teal-700 font-bold">JK</span></div><div><h4 class="font-semibold">James K.</h4><p class="text-sm text-gray-500">Father of 6-year-old Kiswahili learner</p></div></div></div>
                <div class="bg-gray-50 p-6 rounded-lg shadow-md"><div class="flex text-yellow-400 mb-3"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p class="text-gray-700 italic mb-4">"I grew up disconnected from my Nigerian heritage. iSPEAK is giving my children what I never had - a real connection to our language and culture. When they spoke Yoruba to their grandmother for the first time, she cried with joy. That moment was priceless."</p><div class="flex items-center"><div class="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mr-3"><span class="text-yellow-700 font-bold">TA</span></div><div><h4 class="font-semibold">Tola A.</h4><p class="text-sm text-gray-500">Mother of two Yoruba learners</p></div></div></div>
                <div class="bg-gray-50 p-6 rounded-lg shadow-md"><div class="flex text-yellow-400 mb-3"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p class="text-gray-700 italic mb-4">"The educators at iSPEAK understand the unique challenges of heritage language learners. Our son went through a silent period where he was hesitant to speak Twi, and they were so patient and supportive. Now he's chatting away! Their educational philosophy really works."</p><div class="flex items-center"><div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-3"><span class="text-blue-700 font-bold">DM</span></div><div><h4 class="font-semibold">Daniel M.</h4><p class="text-sm text-gray-500">Father of 9-year-old Twi learner</p></div></div></div>
            </div>
        </div>
    </section>
    
    <!-- Call to Action Section -->
    <section class="py-12 md:py-16 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div class="container mx-auto px-4">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="text-2xl md:text-3xl font-bold mb-4">Ready to connect your child with their heritage?</h2>
                <p class="text-lg mb-8">Join thousands of families preserving indigenous languages and building cultural bridges for the next generation.</p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="#" class="btn-primary px-6 py-3 rounded-md font-medium">Register For Classes</a>
                    <a href="#" class="bg-white text-teal-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition duration-300">Book a Free Trial</a>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="bg-gray-900 text-white pt-12 md:pt-16 pb-6">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                <div class="lg:col-span-2">
                    <!-- Corrected Footer Logo Path -->
                    <img src="/ISPEAK.png" alt="iSPEAK Logo" class="h-12 md:h-16 mb-4">
                    <p class="text-gray-400 mb-6">Connecting children to heritage through language</p>
                    <div class="space-y-2">
                        <div class="flex items-start"><span class="text-gray-300 font-medium mr-2 w-24 inline-block">Owner:</span><span class="text-gray-400">Daisy Ross</span></div>
                        <div class="flex items-start"><span class="text-gray-300 font-medium mr-2 w-24 inline-block">Phone:</span><span class="text-gray-400">+1 (478) 390-4040</span></div>
                        <div class="flex items-start"><span class="text-gray-300 font-medium mr-2 w-24 inline-block">Email:</span><span class="text-gray-400">info@ispeaklanguage.org</span></div>
                        <div class="flex items-start"><span class="text-gray-300 font-medium mr-2 w-24 inline-block">Hours:</span><span class="text-gray-400">Monday-Friday, 9am-5pm Eastern Time</span></div>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg md:text-xl font-bold mb-4">Quick Links</h3>
                    <ul class="space-y-2">
                        <li><a href="/" class="text-gray-400 hover:text-white transition duration-300">Home</a></li>
                        <li><a href="/about" class="text-gray-400 hover:text-white transition duration-300">About Us</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Plans & Pricing</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Paji Shop</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Free Registration</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Login</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Contact Us</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg md:text-xl font-bold mb-4">Resources</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Free Printables</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Articles</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">FAQs</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Educator Applications</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Loyalty Program</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg md:text-xl font-bold mb-4">Join Our Newsletter</h3>
                    <p class="text-gray-400 mb-4">Join our newsletter for language tips and cultural insights</p>
                    <div class="flex flex-col sm:flex-row">
                        <input type="email" placeholder="Your email" class="px-3 py-2 rounded-md sm:rounded-r-none w-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2 sm:mb-0">
                        <button class="bg-teal-500 text-white px-4 py-2 rounded-md sm:rounded-l-none hover:bg-teal-600 transition duration-300">Subscribe</button>
                    </div>
                    <div class="mt-6">
                        <h3 class="text-lg md:text-xl font-bold mb-4">Follow Us</h3>
                        <div class="flex space-x-3">
                            <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition duration-300"><i class="fab fa-facebook-f text-white"></i></a>
                            <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition duration-300"><i class="fab fa-instagram text-white"></i></a>
                            <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition duration-300"><i class="fab fa-youtube text-white"></i></a>
                            <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition duration-300"><i class="fab fa-twitter text-white"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-6 pb-4">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="mb-4 md:mb-0"><p class="text-gray-500">&copy; 2025 iSPEAK Language Learning Program. All Rights Reserved.</p></div>
                    <div class="flex flex-wrap justify-center footer-links">
                        <a href="#" class="text-gray-500 hover:text-gray-400 mx-2 mb-2 md:mb-0">Privacy Policy</a>
                        <a href="#" class="text-gray-500 hover:text-gray-400 mx-2 mb-2 md:mb-0">Terms of Service</a>
                        <a href="#" class="text-gray-500 hover:text-gray-400 mx-2 mb-2 md:mb-0">Child Safety Statement</a>
                        <a href="#" class="text-gray-500 hover:text-gray-400 mx-2 mb-2 md:mb-0">Refund Policy</a>
                        <a href="#" class="text-gray-500 hover:text-gray-400 mx-2 mb-2 md:mb-0">Accessibility Statement</a>
                    </div>
                </div>
                <div class="text-center text-gray-500 text-sm mt-4">Proudly created in partnership with NyaEden.</div>
            </div>
        </div>
    </footer>
    
    <script>
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenuCloseBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => { mobileMenu.classList.add('active'); document.body.style.overflow = 'hidden'; });
            mobileMenuCloseBtn.addEventListener('click', () => { mobileMenu.classList.remove('active'); document.body.style.overflow = ''; });
        }
        // Mobile dropdown toggles
        const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
        mobileDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const content = toggle.nextElementSibling; content.classList.toggle('hidden');
                const icon = toggle.querySelector('i');
                if (content.classList.contains('hidden')) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
                else { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
            });
        });
        // Make first mobile dropdown expanded by default
        const firstMobileDropdown = document.querySelector('.mobile-dropdown-content');
        if (firstMobileDropdown) {
            firstMobileDropdown.classList.remove('hidden');
            const icon = firstMobileDropdown.previousElementSibling.querySelector('i');
            if (icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
        }
        // Page navigation highlighting
