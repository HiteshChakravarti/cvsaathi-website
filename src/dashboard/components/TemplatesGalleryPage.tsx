import { useState, useEffect } from "react";
import { 
  ChevronLeft, Download, Eye, Search, Filter, FileText, 
  X, ZoomIn, ZoomOut, Loader2, CheckCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

interface TemplatesGalleryPageProps {
  isDark: boolean;
  onBack: () => void;
}

interface Template {
  id: string;
  name: string;
  category: 'Entry-Level' | 'Professional';
  fileName: string;
  filePath: string;
  size: number;
  description: string;
}

// Template metadata based on filenames
const templateMetadata: Record<string, { category: 'Entry-Level' | 'Professional'; description: string }> = {
  '(Entry-Level) Resume.pdf': { 
    category: 'Entry-Level', 
    description: 'Perfect for fresh graduates and entry-level positions' 
  },
  'Fresher-ready.pdf': { 
    category: 'Entry-Level', 
    description: 'Clean and simple template for first-time job seekers' 
  },
  'Fresher-ready - "Business Administration student. looking forward to my first work experience.".pdf': { 
    category: 'Entry-Level', 
    description: 'Business-focused template for fresh graduates' 
  },
  'Professional (Experienced).pdf': { 
    category: 'Professional', 
    description: 'Classic professional template for experienced candidates' 
  },
  'Professional (Experienced)  - Web Developer. "5 years of experience" + multi-role history..pdf': { 
    category: 'Professional', 
    description: 'Tech-focused template highlighting multiple roles and experience' 
  },
  'Professional (Experienced)  -Graphic Designer. 2018→Now across 3 companies..pdf': { 
    category: 'Professional', 
    description: 'Creative industry template with timeline emphasis' 
  },
  'Professional (Experienced)  - Awards & Education. Long management track.pdf': { 
    category: 'Professional', 
    description: 'Leadership-focused template highlighting achievements and education' 
  },
  'Professional (Experienced) - Accounting Executive..pdf': { 
    category: 'Professional', 
    description: 'Finance and accounting professional template' 
  },
  'Professional (Experienced) -Executive Secretary. "over 7 years of experience.".pdf': { 
    category: 'Professional', 
    description: 'Administrative role template for senior positions' 
  },
  'Professional (Experienced) -Head  General Manager. Senior roles with recent tenure..pdf': { 
    category: 'Professional', 
    description: 'Executive-level template for senior management roles' 
  },
  'Professional (Experienced) - Design DirectorSenior Designer timeline shows multi-year track..pdf': { 
    category: 'Professional', 
    description: 'Design leadership template with career progression' 
  },
  'Professional (Experienced) - Experience-Focused. Multiple roles + long timeline..pdf': { 
    category: 'Professional', 
    description: 'Experience-heavy template for candidates with extensive work history' 
  },
  'Professional (Experienced) - Leasing Consultant with 15 years experience..pdf': { 
    category: 'Professional', 
    description: 'Real estate and sales professional template' 
  },
  'Professional (Experienced) - Multiple Marketing Manager stints + full education history..pdf': { 
    category: 'Professional', 
    description: 'Marketing professional template with education emphasis' 
  },
  'Professional (Experienced) - Office Marketing roles 2018→Now with references..pdf': { 
    category: 'Professional', 
    description: 'Marketing template with references section' 
  },
  'Professional (Experienced) - Product Design Manager roles across years + references..pdf': { 
    category: 'Professional', 
    description: 'Product design leadership template' 
  },
  'Professional (Experienced) - Profile-Led. 2024-2030 roles listed..pdf': { 
    category: 'Professional', 
    description: 'Profile-focused template with recent roles highlighted' 
  },
  'Professional (Experienced) - Senior Graphic Designer roles with prior tenure.pdf': { 
    category: 'Professional', 
    description: 'Senior creative professional template' 
  },
  'Professional (Experienced) - Skills-First. ManagerDirector roles 2028→Now.pdf': { 
    category: 'Professional', 
    description: 'Skills-focused template for management roles' 
  },
  'Professional (Experienced) - "five years of experience," multi-role history..pdf': { 
    category: 'Professional', 
    description: 'Multi-role template for candidates with diverse experience' 
  },
};

export function TemplatesGalleryPage({ isDark, onBack }: TemplatesGalleryPageProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Entry-Level' | 'Professional'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        
        // In a real app, you'd fetch this from an API or read from public folder
        // For now, we'll create template objects from the metadata
        const templateList: Template[] = Object.entries(templateMetadata).map(([fileName, meta]) => ({
          id: fileName.replace(/[^a-zA-Z0-9]/g, '_'),
          name: fileName.replace('.pdf', '').replace(/Professional \(Experienced\)\s*-?\s*/g, '').trim() || fileName.replace('.pdf', ''),
          category: meta.category,
          fileName: fileName,
          filePath: `/Resume Templates/${encodeURIComponent(fileName)}`, // Path relative to public folder
          size: 0, // Will be set if we fetch file sizes
          description: meta.description,
        }));

        setTemplates(templateList);
        setFilteredTemplates(templateList);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  const handleDownload = (template: Template) => {
    try {
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = template.filePath;
      link.download = template.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${template.name}...`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template. Please try again.');
    }
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewZoom(100);
  };

  const closePreview = () => {
    setSelectedTemplate(null);
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center ${
        isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50'
      }`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 sticky top-0 z-50 ${
        isDark 
          ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl'
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className="size-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Resume Templates
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Browse and download professional resume templates
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 size-5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2">
              {(['All', 'Entry-Level', 'Professional'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? isDark
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-500 text-white'
                      : isDark
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${
            isDark ? 'bg-white/5' : 'bg-white'
          }`}>
            <FileText className={`size-16 mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No templates found
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`group rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  isDark
                    ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}
              >
                {/* Template Preview/Icon */}
                <div className={`h-48 flex items-center justify-center ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                } rounded-t-xl relative overflow-hidden`}>
                  <FileText className={`size-20 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  } group-hover:scale-110 transition-transform`} />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
                    template.category === 'Entry-Level'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {template.category}
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {template.name}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePreview(template)}
                      variant="outline"
                      className={`flex-1 ${
                        isDark 
                          ? 'border-white/10 hover:bg-white/5 text-white'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Eye className="size-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleDownload(template)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                    >
                      <Download className="size-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {selectedTemplate && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div 
            className={`relative max-w-4xl w-full max-h-[90vh] rounded-xl overflow-hidden ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedTemplate.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedTemplate.category} Template
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}
                >
                  <ZoomOut className="size-5" />
                </button>
                <span className={`text-sm w-16 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {previewZoom}%
                </span>
                <button
                  onClick={() => setPreviewZoom(Math.min(200, previewZoom + 10))}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}
                >
                  <ZoomIn className="size-5" />
                </button>
                <Button
                  onClick={() => handleDownload(selectedTemplate)}
                  className="ml-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  <Download className="size-4 mr-2" />
                  Download
                </Button>
                <button
                  onClick={closePreview}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="overflow-auto max-h-[calc(90vh-80px)] p-4 flex justify-center">
              <iframe
                src={`${selectedTemplate.filePath}#toolbar=0&zoom=${previewZoom}`}
                className="w-full border-0"
                style={{ 
                  minHeight: '600px',
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center'
                }}
                title={selectedTemplate.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

