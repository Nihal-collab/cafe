import React from 'react';
import { Check, ClipboardList, Flame, BellRing, Utensils, Award } from 'lucide-react';

const OrderStatusTracker = ({ status }) => {
  // Define steps
  const steps = [
    { key: 'RECEIVED', label: 'Order Received', icon: ClipboardList, desc: 'Received and sent to kitchen' },
    { key: 'PREPARING', label: 'Preparing', icon: Flame, desc: 'Chef is preparing your meal' },
    { key: 'READY', label: 'Ready', icon: BellRing, desc: 'Food is ready to be served' },
    { key: 'SERVED', label: 'Served', icon: Utensils, desc: 'Served at your table' },
    { key: 'COMPLETED', label: 'Completed', icon: Award, desc: 'Hope you enjoyed the meal!' },
  ];

  // Helper to find the current active step index
  const currentStepIndex = steps.findIndex(step => step.key === status);
  
  // If status is CANCELLED, we display a cancelled block instead
  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <h4 className="font-heading text-lg font-bold text-red-600 mb-1">ORDER CANCELLED</h4>
        <p className="font-body text-sm text-red-500">This order has been cancelled by the management. Please contact the counter for queries.</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 bg-white rounded-2xl border border-coffee/5 shadow-premium">
      <h3 className="font-heading text-xl font-bold text-espresso text-center mb-8">
        Order Status: <span className="text-caramel font-body font-semibold">{status || 'RECEIVED'}</span>
      </h3>
      
      {/* Stepper Container */}
      <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-8 md:space-y-0 md:px-8">
        {/* Connection line for Desktop */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-coffee/5 -translate-y-1/2 hidden md:block z-0">
          <div 
            className="h-full bg-caramel transition-all duration-700" 
            style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isUpcoming = idx > currentStepIndex;
          
          return (
            <div key={step.key} className="flex md:flex-col items-center space-x-4 md:space-x-0 z-10 w-full md:w-auto relative">
              {/* Stepper Circle */}
              <div 
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-caramel border-caramel text-espresso shadow-lg shadow-caramel/20' 
                    : isActive 
                      ? 'bg-coffee border-coffee text-ivory animate-bounce shadow-lg shadow-coffee/30' 
                      : 'bg-white border-coffee/15 text-coffee/30'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              
              {/* Label details */}
              <div className="flex flex-col md:items-center mt-0 md:mt-4 text-left md:text-center">
                <span className={`font-body text-xs font-bold tracking-wide uppercase ${
                  isActive ? 'text-coffee font-semibold' : isCompleted ? 'text-caramel' : 'text-coffee/30'
                }`}>
                  {step.label}
                </span>
                <span className="font-body text-[10px] text-coffee/50 max-w-[150px] hidden md:block mt-1">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
