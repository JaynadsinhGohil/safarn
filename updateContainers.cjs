const fs = require('fs');
const path = require('path');

const files = [
  { 
    name: 'src/pages/Explore.tsx', 
    findContainer: '<div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-24">',
    replaceContainer: '<PageContainer maxWidth="wide" className="py-8 pb-24">'
  },
  { 
    name: 'src/pages/ExploreActivities.tsx', 
    findContainer: '<div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-24">',
    replaceContainer: '<PageContainer maxWidth="wide" className="py-8 pb-24">'
  },
  { 
    name: 'src/pages/Budget.tsx', 
    findContainer: '<div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24">',
    replaceContainer: '<PageContainer maxWidth="wide" className="py-8 pb-24">'
  },
  { 
    name: 'src/pages/CalendarView.tsx', 
    findContainer: '<div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24">',
    replaceContainer: '<PageContainer maxWidth="wide" className="py-8 pb-24">'
  },
  { 
    name: 'src/pages/Settings.tsx', 
    findContainer: '<div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24">',
    replaceContainer: '<PageContainer maxWidth="narrow" className="py-8 pb-24">'
  },
  { 
    name: 'src/pages/Notifications.tsx', 
    findContainer: '<div className="max-w-2xl mx-auto px-4 md:px-8 py-8 pb-24">',
    replaceContainer: '<PageContainer maxWidth="narrow" className="py-8 pb-24">'
  },
  { 
    name: 'src/pages/SharedItinerary.tsx', 
    findContainer: '<div className="max-w-3xl mx-auto px-4 py-8 pb-20">',
    replaceContainer: '<PageContainer maxWidth="default" className="py-8 pb-20">'
  }
];

files.forEach(f => {
  const filePath = path.join(__dirname, f.name);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not present
  if (!content.includes('import { PageContainer }')) {
    content = content.replace(/(import .*;\n)/, `$1import { PageContainer } from '@/components/layout/PageContainer';\n`);
  }
  
  // Replace opening tag
  content = content.replace(f.findContainer, f.replaceContainer);
  
  // Replace the closing div of the container
  // For these pages, the main container is usually the root return element (or right after header)
  // To be safe, we replace the last `</div>` before the final `);` if it's the root container.
  // Actually, for all except SharedItinerary, the container is the root of the return.
  
  // Let's do a simple regex for the final </div> matching the root.
  // For Explore, ExploreActivities, Budget, CalendarView, Settings, Notifications:
  if (f.name !== 'src/pages/SharedItinerary.tsx') {
    content = content.replace(/<\/div>\s*\);\s*}\s*$/, '</PageContainer>\n  );\n}\n');
  } else {
    // SharedItinerary has footer inside it.
    // Replace the </div> just before the main </div>
    content = content.replace(/<\/div>\s*<\/div>\s*\);\s*}\s*$/, '</PageContainer>\n    </div>\n  );\n}\n');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${f.name}`);
});
