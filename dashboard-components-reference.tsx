// ============================================================================
// DASHBOARD COMPONENTS REFERENCE
// Three React Dashboard Components for ETL Technology Product Display
// Saved for future reference - January 2025
// ============================================================================

// ============================================================================
// DASHBOARD 1: ETL Technology - Product Overview
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Zap, Star, Award, Package, Wrench, Shield } from 'lucide-react';

const AnimatedMetric = ({ icon: Icon, label, value, color, delay }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg transform transition-all hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <div className="mb-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.replace('text', 'bg')} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
    </div>
  );
};

const EfficiencyGauge = () => {
  const [angle, setAngle] = useState(-90);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAngle(0);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Award className="w-5 h-5 mr-2 text-yellow-500" />
        Efficiency Rating
      </h3>
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset="0"
            strokeLinecap="round"
            style={{
              strokeDashoffset: `${251.2 * (1 - 0.85)}`,
              transition: 'stroke-dashoffset 1.5s ease-out'
            }}
            transform={`rotate(${angle} 50 50)`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-bold text-gray-800">HIGH</span>
          <span className="text-sm text-gray-500">Performance</span>
        </div>
      </div>
    </div>
  );
};

const PowerRatingChart = () => {
  const [bars, setBars] = useState([0, 0, 0]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setBars([70, 100, 85]);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-blue-500" />
        Power Specifications
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Power Rating</span>
            <span className="text-sm font-semibold text-gray-800">1.6 kW</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${bars[0]}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Energy Rating</span>
            <span className="text-sm font-semibold text-gray-800">1.6</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-1000 ease-out"
              style={{ width: `${bars[1]}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Output Capacity</span>
            <span className="text-sm font-semibold text-gray-800">85%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${bars[2]}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductInfoCard = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 shadow-lg transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Package className="w-5 h-5 mr-2 text-indigo-600" />
        Product Details
      </h3>
      <div className="space-y-3">
        <div className="flex items-start">
          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Brand</p>
            <p className="text-sm text-gray-600">The Splash Lab</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Category</p>
            <p className="text-sm text-gray-600">ETL Technology</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Model</p>
            <p className="text-sm text-gray-600 font-mono">etl_9_75494</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceBadges = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Service & Support</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 rounded-lg p-4 text-center transform transition-all hover:scale-105">
          <Wrench className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Professional</p>
          <p className="text-xs text-gray-600">Installation</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center transform transition-all hover:scale-105">
          <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Comprehensive</p>
          <p className="text-xs text-gray-600">Warranty</p>
        </div>
      </div>
    </div>
  );
};

export function Dashboard1() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">ETL Technology</h1>
        <p className="text-gray-600 mb-8">Model etl_9_75494 - Product Overview</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatedMetric 
            icon={Zap}
            label="Power Rating"
            value="1.6kW"
            color="text-blue-500"
            delay={100}
          />
          <AnimatedMetric 
            icon={Star}
            label="Energy Rating"
            value="1.6"
            color="text-yellow-500"
            delay={200}
          />
          <AnimatedMetric 
            icon={Award}
            label="Efficiency Level"
            value="High"
            color="text-green-500"
            delay={300}
          />
          
          <PowerRatingChart />
          <EfficiencyGauge />
          <div className="space-y-6">
            <ProductInfoCard />
            <ServiceBadges />
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// DASHBOARD 2: Product Specifications
// ============================================================================

import { Euro, FileText, Wrench as Wrench2, Shield as Shield2, Award as Award2, Settings, Plug, Maximize, Weight, Thermometer, Droplets, Volume2, Lock } from 'lucide-react';

const CostCounter = () => {
  const [cost, setCost] = useState(0);
  const targetCost = 0.701;
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = targetCost / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCost) {
        setCost(targetCost);
        clearInterval(timer);
      } else {
        setCost(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 shadow-lg col-span-1 md:col-span-2">
      <div className="flex items-center mb-4">
        <Euro className="w-8 h-8 text-green-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Annual Running Cost</h3>
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold text-green-600 mb-2">
          €{cost.toFixed(3)}
        </div>
        <p className="text-sm text-gray-600">Extremely efficient operation</p>
        <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-3">
          <p className="text-xs text-gray-700">Based on standard usage patterns</p>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, title, value, color, delay }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`bg-white rounded-lg p-5 shadow-lg transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:shadow-xl hover:-translate-y-1`}>
      <div className="flex items-start">
        <div className={`${color} p-3 rounded-lg mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-600 mb-1">{title}</h4>
          <p className="text-base font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

const TemperatureGauge = () => {
  const [temp, setTemp] = useState(-10);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTemp(prev => {
        if (prev >= 40) return -10;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const percentage = ((temp + 10) / 50) * 100;

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Thermometer className="w-6 h-6 text-red-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Operating Temperature</h3>
      </div>
      <div className="relative">
        <div className="h-48 w-16 mx-auto bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 via-yellow-400 to-red-500 transition-all duration-100 ease-linear"
            style={{ height: `${percentage}%` }}
          />
        </div>
        <div className="text-center mt-4">
          <div className="text-2xl font-bold text-gray-800">{temp}°C</div>
          <div className="text-sm text-gray-600">Range: -10°C to +40°C</div>
        </div>
      </div>
    </div>
  );
};

const HumidityMeter = () => {
  const [humidity, setHumidity] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setHumidity(95);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Droplets className="w-6 h-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Humidity Range</h3>
      </div>
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (1 - humidity / 100)}
            strokeLinecap="round"
            className="transition-all duration-1500 ease-out"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-bold text-gray-800">{humidity}%</span>
          <span className="text-xs text-gray-600">RH Max</span>
        </div>
      </div>
    </div>
  );
};

const CertificationBadges = () => {
  const badges = [
    { name: 'ETL', color: 'bg-blue-500', delay: 100 },
    { name: 'CE', color: 'bg-green-500', delay: 200 }
  ];
  
  const [visible, setVisible] = useState([false, false]);
  
  useEffect(() => {
    badges.forEach((badge, index) => {
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, badge.delay);
    });
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Award2 className="w-6 h-6 text-purple-600 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Certifications</h3>
      </div>
      <div className="flex justify-around items-center">
        {badges.map((badge, index) => (
          <div
            key={badge.name}
            className={`${badge.color} text-white rounded-full w-24 h-24 flex items-center justify-center transform transition-all duration-500 ${visible[index] ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} hover:scale-110`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold">{badge.name}</div>
              <div className="text-xs">Certified</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SafetyFeatures = () => {
  const features = [
    'Overload Protection',
    'Thermal Cutoff',
    'Ground Fault Detection',
    'Emergency Shutoff'
  ];
  
  const [activeFeature, setActiveFeature] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg col-span-1 md:col-span-2">
      <div className="flex items-center mb-4">
        <Lock className="w-6 h-6 text-red-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Safety Features</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div
            key={feature}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              activeFeature === index 
                ? 'border-red-500 bg-red-50 shadow-md transform scale-105' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <p className="text-sm font-semibold text-gray-700 text-center">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const NoiseMeter = () => {
  const [waves, setWaves] = useState([0, 0, 0, 0, 0]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setWaves([
        Math.random() * 30 + 10,
        Math.random() * 30 + 10,
        Math.random() * 30 + 10,
        Math.random() * 30 + 10,
        Math.random() * 30 + 10
      ]);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Volume2 className="w-6 h-6 text-green-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Noise Level</h3>
      </div>
      <div className="flex items-end justify-center space-x-2 h-32">
        {waves.map((height, index) => (
          <div
            key={index}
            className="w-8 bg-green-500 rounded-t-lg transition-all duration-500"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="text-center text-sm font-semibold text-gray-700 mt-4">Low Noise Operation</p>
    </div>
  );
};

export function Dashboard2() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Specifications</h1>
        <p className="text-gray-600 mb-8">The Splash Lab - ETL Technology</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CostCounter />
          <InfoCard 
            icon={FileText}
            title="Source"
            value="ETL"
            color="bg-blue-500"
            delay={100}
          />
          <InfoCard 
            icon={FileText}
            title="Subcategory"
            value="The Splash Lab"
            color="bg-indigo-500"
            delay={150}
          />
          <InfoCard 
            icon={Wrench2}
            title="Installation Type"
            value="Professional Recommended"
            color="bg-orange-500"
            delay={200}
          />
          <InfoCard 
            icon={Shield2}
            title="Warranty Period"
            value="2 Years Comprehensive"
            color="bg-green-500"
            delay={250}
          />
          <InfoCard 
            icon={Settings}
            title="Maintenance"
            value="Annual Recommended"
            color="bg-purple-500"
            delay={300}
          />
          <InfoCard 
            icon={Plug}
            title="Compatibility"
            value="Universal"
            color="bg-pink-500"
            delay={350}
          />
          <InfoCard 
            icon={Maximize}
            title="Dimensions"
            value="Standard Industry"
            color="bg-cyan-500"
            delay={400}
          />
          <InfoCard 
            icon={Weight}
            title="Weight"
            value="Varies by Model"
            color="bg-gray-500"
            delay={450}
          />
          
          <TemperatureGauge />
          <HumidityMeter />
          <NoiseMeter />
          <CertificationBadges />
          <SafetyFeatures />
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// DASHBOARD 3: Product Information & Benefits
// ============================================================================

import { Sparkles, Gem, Lightbulb, Heart, TrendingUp, Headphones, Truck, CreditCard, DollarSign, Zap as Zap3, Clock } from 'lucide-react';

const EnergySavingsChart = () => {
  const [savings, setSavings] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSavings(30);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg p-6 shadow-xl col-span-1 md:col-span-2">
      <div className="flex items-center mb-4">
        <Heart className="w-8 h-8 text-white mr-3" />
        <h3 className="text-2xl font-bold text-white">Energy Savings</h3>
      </div>
      <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center mb-4">
          <div className="text-6xl font-bold text-white mb-2">
            {savings}%
          </div>
          <p className="text-white text-lg font-semibold">Reduction in Energy Consumption</p>
        </div>
        <div className="relative h-6 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-yellow-300 rounded-full transition-all duration-2000 ease-out flex items-center justify-end pr-3"
            style={{ width: `${savings}%` }}
          >
            <Zap3 className="w-4 h-4 text-green-700" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-white text-sm">
          <span>Standard</span>
          <span className="font-bold">High Efficiency</span>
        </div>
      </div>
    </div>
  );
};

const ROITimeline = () => {
  const [progress, setProgress] = useState(0);
  const years = ['Year 1', 'Year 2', 'Year 3'];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 3) return 0;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg col-span-1 md:col-span-2">
      <div className="flex items-center mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">Return on Investment</h3>
      </div>
      <div className="mb-4">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-1">2-3 Years</div>
          <p className="text-sm text-gray-600">Typical Payback Period</p>
        </div>
        <div className="flex items-center justify-between mb-3">
          {years.map((year, index) => (
            <React.Fragment key={year}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  index < progress 
                    ? 'bg-blue-600 scale-110 shadow-lg' 
                    : 'bg-gray-200'
                }`}>
                  {index < progress ? (
                    <DollarSign className="w-6 h-6 text-white" />
                  ) : (
                    <Clock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-semibold ${
                  index < progress ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {year}
                </span>
              </div>
              {index < years.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
                  <div 
                    className={`h-full bg-blue-600 rounded transition-all duration-500 ${
                      index < progress - 1 ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon: Icon, title, description, color, delay }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg transition-all duration-700 transform ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } hover:shadow-xl hover:-translate-y-2`}>
      <div className={`${color} w-14 h-14 rounded-full flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

const FeatureHighlight = ({ icon: Icon, title, description, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-gradient-to-br ${color} rounded-lg p-5 shadow-lg transform transition-all duration-300 hover:scale-105 cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        <Icon className="w-6 h-6 text-white mr-3 flex-shrink-0 mt-1" />
        <div>
          <h4 className="text-white font-bold text-base mb-1">{title}</h4>
          <p className={`text-white text-sm transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-90'
          }`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const ValueProposition = () => {
  const [count, setCount] = useState(0);
  const features = ['Efficiency', 'Reliability', 'Performance', 'Support'];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 shadow-xl col-span-1 md:col-span-2">
      <div className="flex items-center mb-4">
        <Gem className="w-8 h-8 text-white mr-3" />
        <h3 className="text-2xl font-bold text-white">Customer Value</h3>
      </div>
      <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center mb-4">
          <h4 className="text-3xl font-bold text-white mb-3">Professional-Grade Equipment</h4>
          <p className="text-white text-lg mb-6">Designed for Commercial Use</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((feature, index) => (
            <div
              key={feature}
              className={`p-3 rounded-lg text-center transition-all duration-500 ${
                count === index
                  ? 'bg-white text-purple-600 shadow-lg scale-110'
                  : 'bg-white bg-opacity-30 text-white'
              }`}
            >
              <p className="font-bold text-sm">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SupportAnimation = () => {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Headphones className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Technical Support</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-4">
        <div className={`relative transition-all duration-500 ${pulse ? 'scale-110' : 'scale-100'}`}>
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
            <Headphones className="w-12 h-12 text-white" />
          </div>
          {pulse && (
            <>
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
              <div className="absolute inset-0 bg-blue-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }} />
            </>
          )}
        </div>
        <p className="text-center text-sm font-semibold text-gray-700 mt-4">
          Comprehensive Support Available
        </p>
        <p className="text-center text-xs text-gray-500 mt-2">
          Expert assistance whenever you need it
        </p>
      </div>
    </div>
  );
};

export function Dashboard3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Information & Benefits</h1>
          <p className="text-gray-600">Discover the value and advantages of our solution</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EnergySavingsChart />
          <ValueProposition />
          <ROITimeline />
          
          <BenefitCard
            icon={Sparkles}
            title="High Efficiency Design"
            description="Advanced technology reduces energy costs while maintaining peak performance"
            color="bg-yellow-500"
            delay={100}
          />
          
          <BenefitCard
            icon={Lightbulb}
            title="Usage Tips"
            description="Regular maintenance ensures optimal performance and extends equipment lifespan"
            color="bg-orange-500"
            delay={200}
          />
          
          <SupportAnimation />
          
          <FeatureHighlight
            icon={Truck}
            title="Fast Delivery"
            description="Quick delivery and professional installation services available"
            color="from-cyan-500 to-blue-600"
          />
          
          <FeatureHighlight
            icon={CreditCard}
            title="Flexible Financing"
            description="Multiple payment options to suit your business needs"
            color="from-pink-500 to-rose-600"
          />
        </div>
      </div>
    </div>
  );
}








