import React from 'react';

export const TipsSection: React.FC = () => {
  // Placeholder data
  const tips = [
    { title: 'Automate Your Savings', excerpt: 'Set up automatic transfers to your savings account each payday.' },
    { title: 'The 50/30/20 Budget Rule', excerpt: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings.' },
    { title: 'Track Your Spending', excerpt: 'Use a budgeting app to see where your money is going each month.' },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#0A422D' }}>
          Top Financial Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tips.map((tip, index) => (
            <div key={index} className="border rounded-lg p-6 shadow-lg bg-white">
              <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
              <p className="text-gray-600">{tip.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};