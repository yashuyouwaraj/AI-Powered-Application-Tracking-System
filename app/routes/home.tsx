import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePageTransition, useStagger } from "~/lib/useAnimations";
import gsap from 'gsap';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Dashboard" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const pageRef = usePageTransition(0.8);
  const headingRef = usePageTransition(0.6);
  const resumesRef = useStagger(0.4, 0.15);
  const emptyRef = usePageTransition(0.6);
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ));

      console.log("parsedResumes", parsedResumes);
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, []);

  return (
    <main 
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20"
    >
      <Navbar />

      <section className="main-section">
        <div ref={headingRef} className="page-heading py-16">
          <h1 className="text-4xl md:text-6xl">Track Your Applications</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600"
                style={{
                  animation: 'spin 1s linear infinite'
                }}
              ></div>
            </div>
            <p className="text-gray-600">Loading your resumes...</p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div ref={resumesRef} className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes?.length === 0 && (
          <div 
            ref={emptyRef}
            className="flex flex-col items-center justify-center mt-10 gap-6 max-w-md"
          >
            <div className="text-6xl">📄</div>
            <p className="text-gray-600 text-center">Start your journey by uploading your first resume. Get instant AI-powered feedback tailored to your target job.</p>
            <Link 
              to="/upload" 
              className="btn-primary px-8 py-3"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' });
              }}
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
