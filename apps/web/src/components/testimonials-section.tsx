import React from 'react';

export const TestimonialsSection: React.FC = () => {
  // Placeholder data
  const testimonials = [
    { name: 'Thando, Johannesburg', quote: 'This app changed the way I look at my finances. I feel so much more in control!' },
    { name: 'Lindiwe, Cape Town', quote: 'The templates are so easy to use and have helped me save more than I thought possible.' },
    { name: 'Bongani, Durban', quote: 'Finally, a budgeting tool that understands the South African context. Highly recommended!' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#0A422D' }}>
          What Our Users Are Saying
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="border rounded-lg p-6 text-center shadow-lg">
              <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
              <p className="font-bold">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};