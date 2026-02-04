import { useStore } from '../contexts/StoreContext';
import { FiTarget, FiEye, FiInfo, FiMapPin, FiPhone, FiMail, FiClock, FiGlobe, FiAward, FiUsers, FiTrendingUp, FiCheck, FiVideo, FiBookOpen, FiHelpCircle, FiMessageCircle } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaWhatsapp, FaChalkboardTeacher, FaHeart } from 'react-icons/fa';
import { useEffect } from 'react';

const About = () => {
  const store = useStore();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    const animatedElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  if (store.loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const achievements = [
    { label: 'Student Satisfaction', value: '98%', icon: FiUsers },
    { label: 'Success Rate', value: '95%', icon: FiTrendingUp },
    { label: 'Course Completion', value: '92%', icon: FiAward }
  ];

  const features = [
    { 
      icon: FiVideo, 
      title: 'Live Classes', 
      description: 'Interactive live sessions with industry experts' 
    },
    { 
      icon: FiBookOpen, 
      title: 'Practical Assignments', 
      description: 'Hands-on projects to reinforce learning' 
    },
    { 
      icon: FiMessageCircle, 
      title: 'Live Webinars', 
      description: 'Regular industry insights and guest lectures' 
    },
    { 
      icon: FiHelpCircle, 
      title: 'Dedicated Support', 
      description: '24/7 student support and mentorship' 
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative text-white py-16 overflow-hidden" style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, #1e40af 100%)` }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {store.logoUrl && (
              <img 
                src={store.getLogoUrl()} 
                alt={store.storeName} 
                className="h-24 w-auto mx-auto mb-6 bg-white rounded-2xl shadow-2xl p-3"
              />
            )}
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{store.storeName}</h1>
            {store.tagline && (
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">{store.tagline}</p>
            )}
          </div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Learn About Section */}
          <div className="mb-16">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Learn About {store.storeName}
              </h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 scroll-animate-scale">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {store.aboutWebsite || `${store.storeName}, a leading educational institute dedicated to providing top-quality tuition, academic coaching, and skill development programs. Our institute was founded with a clear mission: to ensure every student receives personalized attention and achieves academic excellence.`}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                At {store.storeName}, we are committed to nurturing young minds with comprehensive knowledge and practical skills. Our experienced tutors provide one-on-one attention and innovative teaching methods to help students excel in academics and develop essential life skills for a successful future.
              </p>
            </div>
          </div>

          {/* Mission & Vision Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Mission Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 scroll-animate-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiTarget className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {store.mission || "Our mission is driven by our belief in education's transformative power and commitment to positively impacting students' lives, not just by grading them in prestigious companies."}
              </p>
            </div>

            {/* Vision Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 scroll-animate-right">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FiEye className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {store.vision || "GLR Edutech aims to offer high-quality education, fostering innovation, critical thinking, and personal development, making it accessible and empowering individuals to contribute to the tech industry."}
              </p>
            </div>

            {/* Goals Section */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-8 md:col-span-2 scroll-animate">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FiAward className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Goal</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Our goal is to offer top-notch software training and career development support, preparing students for the modern tech industry through comprehensive programs, real-world project experience, and placement support.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Our goal is to offer top-notch software training and career development support, preparing students for the modern tech industry through comprehensive programs, real-world project experience, and placement support.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ background: 'var(--primary-color)' }}>
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-base">Provide comprehensive software training programs</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ background: 'var(--primary-color)' }}>
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-base">Offer real-world project experience</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ background: 'var(--primary-color)' }}>
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-base">Foster innovation and critical thinking</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ background: 'var(--primary-color)' }}>
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-base">Support career development and placement</p>
                </div>
              </div>
            </div> */}
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Features</h2>
              <h3 className="text-xl text-gray-600">Comprehensive Course Content</h3>
              <p className="text-gray-600 mt-2 max-w-3xl mx-auto">
                Empower your learning journey with our comprehensive course content, featuring live classes, interactive quizzes, practical assignments, live webinars, and dedicated support services.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className={`scroll-animate-scale delay-${(index + 1) * 100} bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: 'rgba(79,70,229,0.1)' }}>
                    <feature.icon className="w-7 h-7" style={{ color: 'var(--primary-color)' }} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor Section */}
          <div className="mb-16">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Meet Our Founder</h2>
              <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--primary-color)' }}>Shivaramakrishna M</h3>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl overflow-hidden p-8 md:p-12 scroll-animate-scale mb-12">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  BharathKids was born from a simple but powerful dream—a dream where Indian children grow up not just smart in academics, but strong in values, confident in communication, disciplined in habits, and proud of their culture.
                </p>
                <p>
                  Shivaramakrishna M deeply observed today's children and families. He noticed that children are not lacking intelligence—but they are slowly losing focus, patience, respect, confidence, and connection with real life.
                </p>
                <p className="italic text-gray-600">
                  Mobile screens are replacing conversations. <br />
                  Marks are replacing understanding. <br />
                  Technology is growing faster than values.
                </p>
                <p>
                  As an Indian and as someone who strongly believes that the future of the nation depends on the character of its children, Shivaramakrishna M felt a responsibility to act.
                </p>
                <div className="bg-white p-6 rounded-xl mt-6">
                  <p className="font-bold text-gray-900 mb-3">BharathKids is his effort to give children what modern education often misses:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>The confidence to speak without fear</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>The habit of disciplined learning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>Respect for parents, teachers and society</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>Love for Indian values and culture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>Wise use of technology, not addiction</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* India Flag Section */}
          <div className="mb-16">
            <div className="text-center scroll-animate-scale">
              <div className="inline-block bg-gradient-to-r from-orange-500 via-white to-green-600 p-1 rounded-2xl shadow-2xl mb-6">
                <div className="bg-white px-12 py-8 rounded-xl">
                  <div className="text-8xl mb-4">🇮🇳</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Proud to Serve India
                  </h3>
                  <p className="text-xl text-gray-700 font-semibold">
                    Shaping Confident, Focused & Value-Driven Children for India's Future
                  </p>
                </div>
              </div>
              <div className="max-w-3xl mx-auto bg-gradient-to-br from-orange-50 to-green-50 p-6 rounded-xl">
                <p className="text-lg text-gray-700 italic">
                  "Building tomorrow's responsible citizens today - One child, one family, one value at a time."
                </p>
              </div>
            </div>
          </div>

          {/* Vision & Mission Section */}
          {/* <div className="mb-16">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
                Our Vision & Mission
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="scroll-animate-left bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                  <FiTarget className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Vision</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed italic text-center">
                  "If we shape children with the right values, skills and mindset today, we build a stronger, wiser and more responsible Bharat tomorrow." 🇮🇳
                </p>
              </div>

              <div className="scroll-animate-right bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                  <FaHeart className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Mission</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed italic text-center">
                  BharathKids is not just a program. It is a mission to nurture India's next generation—one child, one family, one habit at a time.
                </p>
              </div>
            </div>
          </div> */}

   

          {/* Achievements Section */}
        

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {store.address && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(79,70,229,0.1)' }}>
                      <FiMapPin className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Address</h3>
                    <p className="text-gray-600 text-base">{store.getFullAddress()}</p>
                  </div>
                </div>
              )}
              
              {store.phone && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(79,70,229,0.1)' }}>
                      <FiPhone className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Phone</h3>
                    <p className="text-gray-600 text-base">{store.phone}</p>
                    {store.alternatePhone && (
                      <p className="text-gray-600 text-base">{store.alternatePhone}</p>
                    )}
                  </div>
                </div>
              )}

              {store.email && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(79,70,229,0.1)' }}>
                      <FiMail className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Email</h3>
                    <p className="text-gray-600 text-base">{store.email}</p>
                  </div>
                </div>
              )}

              {store.workingHours && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(79,70,229,0.1)' }}>
                      <FiClock className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Working Hours</h3>
                    <p className="text-gray-600 text-base">{store.workingHours}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media & Website */}
            {(store.facebook || store.instagram || store.whatsapp || store.website) && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-6 text-xl">Connect With Us</h3>
                <div className="flex flex-wrap gap-4">
                  {store.facebook && (
                    <a 
                      href={store.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-semibold"
                    >
                      <FaFacebook className="w-5 h-5" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {store.instagram && (
                    <a 
                      href={store.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-md hover:shadow-lg font-semibold"
                    >
                      <FaInstagram className="w-5 h-5" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {store.whatsapp && (
                    <a 
                      href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg font-semibold"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {store.website && (
                    <a 
                      href={store.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg font-semibold"
                    >
                      <FiGlobe className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
