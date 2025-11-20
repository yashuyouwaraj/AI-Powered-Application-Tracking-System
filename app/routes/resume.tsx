import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading])

  useEffect(() => {
    const loadResume = async () => {
      try {
        const resume = await kv.get(`resume:${id}`);
        if (!resume) {
          console.warn('Resume not found for id:', id);
          return;
        }

        const data = JSON.parse(resume);
        console.log('📋 Loaded resume data:', data);
        
        // Load PDF for download link
        try {
          const resumeBlob = await fs.read(data.resumePath);
          if (resumeBlob) {
            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);
            console.log('✅ PDF loaded, URL:', resumeUrl.substring(0, 50));
          }
        } catch (pdfErr) {
          console.warn('Failed to load PDF:', pdfErr);
        }
        
        // Load image from filesystem
        try {
          console.log('Loading image from path:', data.imagePath);
          const imageBlob = await fs.read(data.imagePath);
          console.log('Image blob received:', imageBlob ? 'yes, size: ' + imageBlob.size : 'null');
          
          if (imageBlob && imageBlob.size > 0) {
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);
            console.log('✅ Image loaded, URL:', imageUrl.substring(0, 50));
          } else {
            console.warn('Image blob is empty or null');
          }
        } catch (imgErr) {
          console.error('Failed to load image:', imgErr);
        }
        
        setFeedback(data.feedback);
      } catch (err) {
        console.error('Error loading resume:', err);
      }
    };
    loadResume();
  }, [id]);
  return (
    <main>
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to HomePage
          </span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-100vh sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>
        <section className="feedback-section">
            <h2 className="text-4xl text-black font-bold">Resume Review</h2>
            {feedback ?(
                <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                    <Summary feedback={feedback}/>
                    <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}/>
                    <Details feedback={feedback}/>
                </div>
            ):(
                <img src="/images/resume-scan-2.gif" className="w-full" />
            )

            }
        </section>
      </div>
    </main>
  );
};

export default resume;
