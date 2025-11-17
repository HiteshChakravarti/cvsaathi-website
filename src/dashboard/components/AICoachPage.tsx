import { useState, useEffect } from "react";
import { Plus, ChevronLeft, MoreHorizontal, Send, Search, Loader2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useAIConversations, AIMessage } from "../../hooks/useAIConversations";
import { useAICareerService } from "../../services/aiCareerService";
import { useAuth } from "../../contexts/AuthContext";
// AI Career Coach mascot - using public path
const estelMascot = "/AI Career Coch.png";

interface AICoachPageProps {
  isDark: boolean;
  onBack: () => void;
}

const quickPrompts = [
  "Review my resume",
  "Career guidance advice",
  "Optimize my LinkedIn profile",
  "Interview preparation tips",
  "Plan my career path",
  "Cover letter help",
];

export function AICoachPage({ isDark, onBack }: AICoachPageProps) {
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading, createConversation, addMessage, saveAIResponse, deleteConversation } = useAIConversations();
  const { sendMessage: sendAIMessage } = useAICareerService();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [message, setMessage] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentSessionId) {
      const conversation = conversations.find(c => c.session_id === currentSessionId);
      if (conversation?.messages) {
        setMessages(conversation.messages as AIMessage[]);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentSessionId, conversations]);


  const handleNewChat = async () => {
    try {
      const newConv = await createConversation('New Conversation', 'general');
      setCurrentSessionId(newConv.session_id);
      setMessages([]);
      setMessage("");
      toast.success('New conversation created!');
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Failed to create new conversation: ${errorMessage}. Check console for details.`);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    setMessage(prompt);
    // Create conversation if none exists
    if (!currentSessionId) {
      handleNewChat();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const userMessage = message.trim();
    setMessage("");
    setSending(true);

    try {
      // Create conversation if none exists
      let sessionId = currentSessionId;
      if (!sessionId) {
        try {
          const newConv = await createConversation(userMessage.substring(0, 50), 'general');
          sessionId = newConv.session_id;
          setCurrentSessionId(sessionId);
        } catch (createError: any) {
          console.error('Failed to create conversation:', createError);
          toast.error(`Failed to create conversation: ${createError?.message || 'Unknown error'}`);
          setSending(false);
          return;
        }
      }

      // Add user message to UI immediately
      const userMsg: AIMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMsg]);

      // Get AI response using ai-career-companion edge function
      console.log('Sending message to AI service:', userMessage.substring(0, 50));
      const response = await sendAIMessage(userMessage, {
        contextType: 'general',
        conversationId: sessionId,
      }, 'en');
      
      if (!response) {
        console.error('AI service returned null - check subscription, usage limits, or API connection');
        throw new Error('No response from AI service. Please check your subscription status or try again later.');
      }

      console.log('AI response received:', {
        hasItems: !!response.items,
        itemsCount: response.items?.length || 0,
      });
      
      // Add AI response
      const aiContent = response.items.map(item => item.content).join('\n');
      const aiMsg: AIMessage = {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Save both user message and AI response to database
      await saveAIResponse(sessionId, userMessage, aiContent, {
        contextType: 'general',
        conversationId: sessionId,
      });

      toast.success('Message sent successfully!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Failed to send message: ${errorMessage}. Check console for details.`);
      // Remove the user message from UI if it failed
      setMessages(prev => prev.filter((msg, idx) => idx < prev.length - 1 || msg.role !== 'user'));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <aside className={`w-72 border-r flex flex-col transition-colors duration-500 ${
        isDark 
          ? 'bg-slate-950 border-white/10' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Back Button */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
        </div>

        {/* Estel Mascot */}
        <div className="p-6 flex justify-center">
          <div className="w-64 h-64 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full blur-2xl opacity-30"></div>
            <img 
              src={estelMascot} 
              alt="Estel AI Coach"
              className="relative z-10 w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Estel Name */}
        <div className="px-6 pb-4 text-center">
          <h2 className="text-xl text-white mb-1">Estel</h2>
          <p className="text-sm text-gray-400">AI Career Coach</p>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-6">
          <Button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
          >
            <Plus className="size-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-400">History</h3>
          </div>
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.session_id}
                  onClick={() => setCurrentSessionId(conv.session_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors group cursor-pointer ${
                    currentSessionId === conv.session_id
                      ? 'bg-teal-500/20 border border-teal-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{conv.title || 'New Conversation'}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(conv.updated_at)}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.session_id);
                          if (currentSessionId === conv.session_id) {
                            setCurrentSessionId(null);
                            setMessages([]);
                          }
                        }}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No conversations yet</p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col transition-colors duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900' 
          : 'bg-gradient-to-br from-white via-teal-50 to-cyan-50'
      }`}>
        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                {/* Greeting */}
                <div className="text-center mb-12">
                  <h1 className={`text-5xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Hey, it's <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Estel</span> 👋
                  </h1>
                  <p className={`text-2xl ${isDark ? 'text-white/90' : 'text-gray-700'}`}>How can I help?</p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  {quickPrompts.slice(0, 4).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className={`p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 text-left group ${
                        isDark
                          ? 'bg-white/10 border-white/20 hover:bg-white/20'
                          : 'bg-white/80 border-teal-200 hover:bg-white hover:shadow-lg hover:border-teal-300'
                      }`}
                    >
                      <p className={`group-hover:translate-x-1 transition-transform duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                        : isDark
                          ? 'bg-white/10 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className={`p-6 border-t backdrop-blur-xl transition-colors duration-500 ${
          isDark
            ? 'border-white/10 bg-black/20'
            : 'border-teal-200 bg-white/50'
        }`}>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Send a message..."
                className={`w-full px-6 py-4 pr-12 rounded-2xl backdrop-blur-sm border focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-colors duration-500 ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
                    : 'bg-white border-teal-200 text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </button>
            </div>
            <p className={`text-xs text-center mt-3 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              Estel helpers may make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}