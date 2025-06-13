import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Calendar, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
}

const SaaSLandingPage: React.FC = () => {
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create properly typed style objects
  const createColorStyle = (color?: string): React.CSSProperties => ({
    color: color || '#3B82F6'
  });

  const createBackgroundStyle = (color?: string): React.CSSProperties => ({
    backgroundColor: color || '#3B82F6'
  });

  const createBorderStyle = (color?: string): React.CSSProperties => ({
    borderColor: color || '#3B82F6'
  });

  useEffect(() => {
    // Extract tenant from subdomain or URL parameter for testing
    const extractTenantConfig = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        
        let tenantKey = null;
        
        // Check URL parameter first (for testing)
        if (tenantParam) {
          tenantKey = tenantParam;
        } else if (subdomain && subdomain !== 'www' && subdomain !== hostname) {
          tenantKey = subdomain;
        }
        
        if (tenantKey) {
          // Fetch tenant config from API
          const response = await fetch(`/api/tenants/key/${tenantKey}`);
          if (response.ok) {
            const tenant = await response.json();
            setTenantConfig({
              id: tenant.tenantKey,
              name: tenant.name,
              domain: tenant.domain,
              primaryColor: tenant.primaryColor || '#3B82F6',
              secondaryColor: tenant.secondaryColor || '#1E40AF',
              logo: tenant.logo
            });
            return;
          }
        }
        
        // Use default config if no tenant found
        setTenantConfig({
          id: 'default',
          name: 'HotelSaaS',
          domain: 'hotelsaas.com',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        });
      } catch (error) {
        console.error('Error fetching tenant config:', error);
        // Fallback to default
        setTenantConfig({
          id: 'default',
          name: 'HotelSaaS',
          domain: 'hotelsaas.com',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        });
      } finally {
        setLoading(false);
      }
    };

    extractTenantConfig();
  }, []);

  const features = [
    {
      icon: Building,
      title: 'Multi-Property Management',
      description: 'Manage multiple hotels and properties from a single dashboard'
    },
    {
      icon: Calendar,
      title: 'Smart Reservations',
      description: 'AI-powered booking system with real-time availability'
    },
    {
      icon: Users,
      title: 'Guest Experience',
      description: 'Personalized guest journeys and loyalty programs'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Real-time insights and performance analytics'
    },
    {
      icon: Smartphone,
      title: 'Mobile Check-in',
      description: 'Contactless check-in with face recognition'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with compliance features'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Hotel Manager',
      company: 'Luxury Suites Chain',
      content: 'This platform transformed our operations. 40% increase in efficiency!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Operations Director',
      company: 'Boutique Hotels Group',
      content: 'The AI-powered features are incredible. Our guests love the experience.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Regional Manager',
      company: 'Resort Collection',
      content: 'Best investment we made. ROI was visible within the first month.',
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white" 
      style={{ 
        '--primary-color': tenantConfig?.primaryColor || '#3B82F6' 
      } as React.CSSProperties & Record<string, string>}
    >
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {tenantConfig?.logo ? (
                <img src={tenantConfig.logo} alt={tenantConfig.name} className="h-8 w-auto" />
              ) : (
                <div className="text-2xl font-bold" style={createColorStyle(tenantConfig?.primaryColor)}>
                  {tenantConfig?.name}
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
              <button className="px-4 py-2 text-white rounded-lg" 
                      style={createBackgroundStyle(tenantConfig?.primaryColor)}>
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              The Future of
              <span className="block" style={createColorStyle(tenantConfig?.primaryColor)}>
                Hotel Management
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              AI-powered hotel management platform with contactless check-in, 
              smart reservations, and multi-property management.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="px-8 py-4 text-white rounded-lg text-lg font-semibold flex items-center justify-center"
                      style={createBackgroundStyle(tenantConfig?.primaryColor)}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="px-8 py-4 border-2 text-gray-700 rounded-lg text-lg font-semibold"
                      style={createBorderStyle(tenantConfig?.primaryColor)}>
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Hotel
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered check-ins to comprehensive analytics, 
              our platform covers every aspect of modern hotel management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <feature.icon className="h-12 w-12 mb-4" style={createColorStyle(tenantConfig?.primaryColor)} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Check-in Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                AI-Powered Contactless Check-in
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Revolutionary face recognition and passport scanning technology 
                enables guests to check in within seconds, without any human interaction.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3" style={createColorStyle(tenantConfig?.primaryColor)} />
                  <span className="text-gray-700">Face recognition authentication</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3" style={createColorStyle(tenantConfig?.primaryColor)} />
                  <span className="text-gray-700">Automatic passport scanning</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3" style={createColorStyle(tenantConfig?.primaryColor)} />
                  <span className="text-gray-700">Digital key delivery</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3" style={createColorStyle(tenantConfig?.primaryColor)} />
                  <span className="text-gray-700">Multi-language support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl p-8">
                <div className="text-center">
                  <Smartphone className="h-16 w-16 mx-auto mb-4" style={createColorStyle(tenantConfig?.primaryColor)} />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Check-in Demo</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Face Scan</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Passport Verification</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={createColorStyle(tenantConfig?.primaryColor)}>
                          Digital Key Ready
                        </span>
                        <Zap className="h-5 w-5" style={createColorStyle(tenantConfig?.primaryColor)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Hotel Chains Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about their experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Hotel?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of hotels already using our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">{tenantConfig?.name}</div>
              <p className="text-gray-400">
                The future of hotel management is here.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {tenantConfig?.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SaaSLandingPage;
