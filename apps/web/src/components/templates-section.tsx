import React from 'react';
import { DownloadButton } from './download-button';

export const TemplatesSection: React.FC = () => {
  // Placeholder data - this will be replaced with dynamic data later
  const templates = [
    { name: 'Monthly Budget Template', description: 'A comprehensive template for tracking monthly income and expenses.', file: 'monthly-budget.pdf' },
    { name: 'Student Budget Template', description: 'A simple template designed for students to manage their finances.', file: 'student-budget.pdf' },
    { name: 'Family Budget Template', description: 'A detailed template for families to manage household expenses.', file: 'family-budget.pdf' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#0A422D' }}>
          Free Budget Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <div key={index} className="border rounded-lg p-6 text-center shadow-lg">
              <h3 className="text-xl font-bold mb-2">{template.name}</h3>
              <p className="text-gray-600 mb-4">{template.description}</p>
              <DownloadButton fileUrl={`/templates/${template.file}`} fileName={template.file} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};