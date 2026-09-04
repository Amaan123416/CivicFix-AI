const rules = [
  {
    category: 'Road Damage',
    keywords: ['pothole', 'road', 'street', 'asphalt', 'crack', 'traffic'],
    recommendation: 'Route to public works for an on-site inspection and temporary hazard marking.',
  },
  {
    category: 'Waste Management',
    keywords: ['garbage', 'waste', 'trash', 'dump', 'rubbish', 'collection'],
    recommendation: 'Assign to sanitation services for collection and area cleanup.',
  },
  {
    category: 'Streetlight',
    keywords: ['light', 'streetlight', 'lamp', 'dark', 'electricity'],
    recommendation: 'Dispatch electrical maintenance to inspect the fixture and power supply.',
  },
  {
    category: 'Water/Sewerage',
    keywords: ['water', 'pipe', 'leak', 'sewer', 'drain', 'flood'],
    recommendation: 'Escalate to water services to inspect the line and prevent further damage.',
  },
];

const analyzeComplaint = ({ title = '', description = '', category = 'Other', priority = 'Medium' }) => {
  const text = `${title} ${description}`.toLowerCase();
  const matchedRule = rules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
  const detectedCategory = matchedRule?.category || category;
  const detectedPriority = priority || (text.includes('danger') || text.includes('urgent') ? 'High' : 'Medium');

  return {
    category: detectedCategory,
    priority: detectedPriority,
    confidence: matchedRule ? 0.88 : 0.64,
    recommendation: matchedRule?.recommendation || 'Review the report and assign it to the relevant municipal department.',
  };
};

module.exports = analyzeComplaint;
