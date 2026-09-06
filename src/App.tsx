import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";

// Lazy-loaded routes — shrinks initial marketing bundle for faster SEO paint.
const Auth = lazy(() => import("./pages/Auth"));
const Docs = lazy(() => import("./pages/Docs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));
const PressKit = lazy(() => import("./pages/PressKit"));
const Partners = lazy(() => import("./pages/Partners"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Community = lazy(() => import("./pages/Community"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const ReplaceSlackNotion = lazy(() => import("./pages/ReplaceSlackNotion"));
const SmallTeamWorkspace = lazy(() => import("./pages/SmallTeamWorkspace"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Security = lazy(() => import("./pages/Security"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const GDPR = lazy(() => import("./pages/GDPR"));
const DataProcessing = lazy(() => import("./pages/DataProcessing"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <p className="text-muted-foreground text-sm">Loading…</p>
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <CanonicalSync />
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
