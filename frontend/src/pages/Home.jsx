import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiShoppingCart, FiFileText, FiPhone, FiMail, FiMapPin, FiAward, FiUsers, FiTrendingUp, FiTarget, FiBriefcase, FiBookOpen, FiStar, FiCheck, FiX, FiClock, FiCalendar, FiMonitor, FiInfo } from 'react-icons/fi';
import { FaWhatsapp, FaRegLightbulb, FaMobile, FaBrain, FaGamepad, FaLanguage, FaRobot, FaHeart, FaBook, FaMicrophone, FaShieldAlt, FaChild } from 'react-icons/fa';
import { useStore } from '../contexts/StoreContext';
import { useEffect, useRef } from 'react';

const Home = () => {
  const { t } = useTranslation();
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

  const kidsHave = [
    { icon: FaMobile, text: 'Mobile phones in their hands' },
    { icon: FaBrain, text: 'Information everywhere' },
    { icon: FaGamepad, text: 'Entertainment anytime' }
  ];

  const kidsMissing = [
    'Focus and patience',
    'Confidence to speak',
    'Respect, discipline & values',
    'Connection with Indian culture',
    'Control over mobile usage',
    'Love for learning'
  ];

  const parentConcerns = [
    '"My child is intelligent, but distracted."',
    '"My child studies, but doesn\'t understand deeply."',
    '"My child knows English, but cannot speak Hindi confidently."',
    '"My child is always on mobile."'
  ];

  const promises = [
    { icon: FaMicrophone, text: 'Speak Hindi confidently without fear' },
    { icon: FaBrain, text: 'Think clearly in Maths, not just memorize' },
    { icon: FaMobile, text: 'Reduce mobile addiction and improve focus' },
    { icon: FaHeart, text: 'Develop discipline, respect & responsibility' },
    { icon: FiUsers, text: 'Gain confidence to speak and express ideas' },
    { icon: FaRobot, text: 'Understand AI & technology safely' }
  ];

  const curriculum = [
    {
      icon: FaBrain,
      title: 'Maths – Remove Fear, Build Thinking',
      subtitle: 'Today, many children fear Maths. We change that.',
      points: ['Mental maths & real-life problems', 'Logical thinking & puzzles', 'Confidence-building practice'],
      result: 'A child who thinks, not panics.'
    },
    {
      icon: FaMicrophone,
      title: 'Spoken Hindi – Give Your Child a Voice ⭐',
      subtitle: 'Hindi is our national language, but many children hesitate to speak it.',
      points: ['Daily spoken Hindi practice', 'Simple sentences, no heavy grammar', 'Role plays, stories & conversations'],
      result: 'Your child speaks Hindi naturally and confidently.'
    },
    {
      icon: FaMobile,
      title: 'Mobile De-Addiction – Teach Control, Not Fear',
      subtitle: 'We don\'t say "don\'t use mobile". We teach how to control it.',
      points: ['Screen-time awareness', 'Offline brain activities', 'Parent-guided habit tracking'],
      result: 'Reduced screen time, improved focus.'
    },
    {
      icon: FaHeart,
      title: 'Values & Ethics – Build Character Early',
      subtitle: 'Marks can be earned later. Values must be built now.',
      points: ['Respect for parents & teachers', 'Discipline & responsibility', 'Indian culture & moral stories'],
      result: 'A good human being, not just a good student.'
    },
    {
      icon: FaRobot,
      title: 'Basic AI Knowledge – Prepare for the Future',
      subtitle: 'The future belongs to children who understand technology wisely.',
      points: ['What is AI?', 'AI in daily life', 'Good vs bad use of technology'],
      result: 'Awareness without addiction.'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      parent: 'Mother of 9-year-old',
      rating: 5,
      feedback: 'My daughter was always hesitant to speak Hindi. After BharathKids, she speaks confidently and even enjoys Hindi stories now!',
      image: null
    },
    {
      name: 'Rajesh Kumar',
      parent: 'Father of 12-year-old',
      rating: 5,
      feedback: 'The mobile addiction program worked wonders. My son now voluntarily keeps his phone aside during study time.',
      image: null
    },
    {
      name: 'Ananya Menon',
      parent: 'Mother of 8-year-old',
      rating: 5,
      feedback: 'Mathematics was a nightmare for my child. BharathKids made it fun and logical. He actually looks forward to math now!',
      image: null
    },
    {
      name: 'Suresh Patel',
      parent: 'Father of 14-year-old',
      rating: 5,
      feedback: 'I gained confidence in speaking English fluently. The interactive sessions and practice exercises were very helpful.',
      image: null
    }
  ];

  const fullAddress = store.getFullAddress();
  const logoUrl = store.getLogoUrl();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-20 sm:py-32 overflow-hidden" style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, #1e40af 100%)` }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="text-center">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={store.storeName}
                className="h-24 sm:h-32 w-auto mx-auto mb-8 bg-white rounded-2xl shadow-2xl p-3"
              />
            )}
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 drop-shadow-lg leading-tight">
              {store.storeName || 'BharathKids'}
            </h1>
            <p className="text-lg sm:text-2xl mb-4 max-w-3xl mx-auto font-medium text-blue-100">
              {store.tagline || 'Shaping Confident, Focused & Value-Driven Children for India\'s Future 🇮🇳'}
            </p>
            <p className="text-base sm:text-lg mb-10 max-w-3xl mx-auto text-blue-50">
              {store.homeText || "A 60-Day Online Transformation Journey for Children (Age 7–15). Because today's kids don't need more screens… they need direction, confidence, values and a voice."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white px-8 py-4 rounded-xl font-bold shadow-2xl hover:shadow-xl transition-all text-lg transform hover:scale-105"
                style={{ color: 'var(--primary-color)' }}
              >
                <FaChild className="w-6 h-6" />
                Enroll Your Child
              </Link>
              <a
                href="#what-kids-missing"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-white transition-all text-lg"
                style={{ color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What Kids Are Missing Section */}
      <section id="what-kids-missing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              What Are Today's Kids Really Missing?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Today's children are growing up in a fast, digital world.
            </p>
          </div>

          {/* What Kids Have */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center scroll-animate delay-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">They have:</h3>
              {kidsHave.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl mb-4 shadow-md">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium text-left">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 scroll-animate delay-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">But they are slowly losing:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {kidsMissing.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-md">
                    <FiX className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parent Concerns */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl scroll-animate-scale mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Many parents feel this every day:
            </h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {parentConcerns.map((concern, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <p className="text-gray-700 italic text-lg">{concern}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center scroll-animate-scale">
            <p className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
              BharathKids was created to solve exactly this problem.
            </p>
          </div>
        </div>
      </section>

      {/* What is BharathKids Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center scroll-animate mb-12">
            <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              🌱 What Is BharathKids?
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              Not Tuition. A Transformation.
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-6 leading-relaxed">
              BharathKids is a <span className="font-bold text-orange-600">60-day online child transformation program</span> designed to rebuild what modern life is slowly taking away—and add the skills today's world truly needs.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl scroll-animate-scale">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">We combine:</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <FaBrain className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <p className="font-bold text-gray-900">Smart Learning</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <FaMicrophone className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <p className="font-bold text-gray-900">Confident Communication</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <FaHeart className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                <p className="font-bold text-gray-900">Indian Values</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <FaShieldAlt className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p className="font-bold text-gray-900">Healthy Digital Habits</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                <FaRobot className="w-12 h-12 mx-auto mb-3 text-indigo-600" />
                <p className="font-bold text-gray-900">Future AI Awareness</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate">
            <div className="inline-block bg-green-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              🌟 Our Promise to Parents
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              In Just 60 Days, Your Child Will:
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promises.map((promise, index) => (
              <div key={index} className={`scroll-animate delay-${(index + 1) * 100} bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500">
                    <promise.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-800 font-semibold text-lg">{promise.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center scroll-animate-scale">
            <p className="text-lg text-gray-700 italic">
              This is not a claim. <br />
              <span className="font-bold text-gray-900">This is the result of daily guided practice, habits and care.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate">
            <div className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              📘 What We Teach (And Why It Matters)
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              Complete Child Development Program
            </h2>
          </div>

          <div className="space-y-8">
            {curriculum.map((subject, index) => (
              <div key={index} className={`scroll-animate delay-${(index + 1) * 100} bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all`}>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary-color)' }}>
                    <subject.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{subject.title}</h3>
                    <p className="text-gray-600 mb-4 italic">{subject.subtitle}</p>
                    <ul className="space-y-2 mb-4">
                      {subject.points.map((point, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="font-bold text-green-800">
                        👉 Result: <span className="text-green-900">{subject.result}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Age Groups */}
            <div className="scroll-animate bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <FaChild className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">Age Groups</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl">
                  <p className="font-bold text-purple-600 mb-1">👦 Juniors</p>
                  <p className="text-gray-700">7–10 years</p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="font-bold text-purple-600 mb-1">👧 Seniors</p>
                  <p className="text-gray-700">11–15 years</p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="font-bold text-purple-600 mb-1">🧑‍🏫 Batch Size</p>
                  <p className="text-gray-700">Small groups for personal attention</p>
                </div>
              </div>
            </div>

            {/* How Program Works */}
            <div className="scroll-animate delay-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <FiClock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Program Structure</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl flex items-center gap-3">
                  <FiClock className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-700">90 minutes per day</p>
                </div>
                <div className="bg-white p-4 rounded-xl flex items-center gap-3">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-700">6 days/week for 60 days</p>
                </div>
                <div className="bg-white p-4 rounded-xl flex items-center gap-3">
                  <FiMonitor className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-700">100% Live Online Classes</p>
                </div>
                <div className="bg-white p-4 rounded-xl flex items-center gap-3">
                  <FiFileText className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-700">Worksheets & recordings</p>
                </div>
              </div>
            </div>

            {/* Program Fee */}
            <div className="scroll-animate delay-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <FiAward className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Investment</h3>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>₹3,000</p>
                <p className="text-gray-600 mb-6">Complete 60-Day Transformation</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Affordable & Result-Oriented</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Limited seats per batch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Early-bird benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Digital Certificate included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Partnership */}
          <div className="mt-12 scroll-animate-scale bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                👨‍👩‍👧 Parents Are Our Partners
              </h3>
              <p className="text-lg text-gray-700">
                We strongly believe transformation happens when parents are involved.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl text-center">
                <FiTrendingUp className="w-10 h-10 mx-auto mb-3 text-orange-600" />
                <p className="font-bold text-gray-900">Weekly Progress Updates</p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center">
                <FiUsers className="w-10 h-10 mx-auto mb-3 text-orange-600" />
                <p className="font-bold text-gray-900">Parent Orientation (Day 1 & 60)</p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center">
                <FiFileText className="w-10 h-10 mx-auto mb-3 text-orange-600" />
                <p className="font-bold text-gray-900">Regular Feedback & Guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              What Parents Are Saying
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real transformations from real families
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`scroll-animate delay-${(index + 1) * 100} bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1`}>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                  "{testimonial.feedback}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.parent}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Link to About Page */}
          <div className="text-center mt-12 scroll-animate-scale">
            <p className="text-lg text-gray-700 mb-4">
              Want to know more about our vision, mission, and founder?
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              style={{ background: 'var(--primary-color)' }}
            >
              <FiInfo className="w-5 h-5" />
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-6xl font-extrabold mb-6 scroll-animate">
            🌈 Give Your Child What School & Screens Can't
          </h2>
          <p className="text-2xl mb-8 scroll-animate-scale">
            Confidence. Values. Focus. Communication.
          </p>
          <p className="text-xl mb-10 scroll-animate delay-100">
            Enroll your child today and start a journey that will stay for life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-animate-scale delay-200">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 bg-white px-10 py-5 rounded-xl font-bold shadow-2xl hover:shadow-xl transition-all text-xl transform hover:scale-105"
              style={{ color: 'var(--primary-color)' }}
            >
              <FaChild className="w-7 h-7" />
              Enroll Now
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-3 border-white px-10 py-5 rounded-xl font-bold shadow-lg hover:bg-white transition-all text-xl"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              <FiPhone className="w-7 h-7" />
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {(store.phone || store.email || fullAddress) && (
        <section id="contact" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-5xl font-bold text-center text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-center text-xl text-gray-600 mb-12">
              <strong>📧 Email:</strong>bharathkids1@gmail.com<br />
              <strong>📱 Contact / WhatsApp:</strong> {store.whatsapp || store.phone || '__________'}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--primary-color)' }}>
                    <FiPhone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 mb-2 font-semibold">Phone</span>
                  <span className="font-bold text-gray-900">{store.phone}</span>
                </a>
              )}

              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-4">
                    <FaWhatsapp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 mb-2 font-semibold">WhatsApp</span>
                  <span className="font-bold text-gray-900">{store.whatsapp}</span>
                </a>
              )}

              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--primary-color)' }}>
                    <FiMail className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 mb-2 font-semibold">Email</span>
                  <span className="font-bold text-gray-900 break-all">{store.email}</span>
                </a>
              )}

              {fullAddress && (
                <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--primary-color)' }}>
                    <FiMapPin className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 mb-2 font-semibold">Address</span>
                  <span className="font-bold text-gray-900">{fullAddress}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-12">
              <p className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
                BharathKids
              </p>
              <p className="text-xl text-gray-700">
                Shaping Confident, Focused & Value-Driven Children for India's Future 🇮🇳
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
