import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import PressKit from "./pages/PressKit";
import Partners from "./pages/Partners";
import Changelog from "./pages/Changelog";
import Community from "./pages/Community";
import StatusPage from "./pages/StatusPage";
import ReplaceSlackNotion from "./pages/ReplaceSlackNotion";
import SmallTeamWorkspace from "./pages/SmallTeamWorkspace";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Security from "./pages/Security";
import CookiePolicy from "./pages/CookiePolicy";
import GDPR from "./pages/GDPR";
import DataProcessing from "./pages/DataProcessing";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/teams" element={<Index />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/press" element={<PressKit />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/community" element={<Community />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/replace-slack-notion" element={<ReplaceSlackNotion />} />
              <Route path="/small-team-workspace" element={<SmallTeamWorkspace />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/security" element={<Security />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/gdpr" element={<GDPR />} />
              <Route path="/data-processing" element={<DataProcessing />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
