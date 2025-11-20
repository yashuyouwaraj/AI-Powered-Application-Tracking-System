import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

type ProcessingStep = 'uploading-file' | 'converting-image' | 'uploading-image' | 'preparing-data' | 'analyzing' | 'complete' | null;

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [currentStep, setCurrentStep] = useState<ProcessingStep>(null);
    const [error, setError] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        setError('');
    }

    const steps = [
        { id: 'uploading-file', label: 'Uploading PDF', icon: '📤' },
        { id: 'converting-image', label: 'Converting to Image', icon: '🖼️' },
        { id: 'uploading-image', label: 'Uploading Image', icon: '☁️' },
        { id: 'preparing-data', label: 'Preparing Data', icon: '⚙️' },
        { id: 'analyzing', label: 'AI Analysis', icon: '🤖' },
    ];

    const stepIndex = steps.findIndex(s => s.id === currentStep);
    const progress = currentStep === 'complete' ? 100 : ((stepIndex + 1) / steps.length) * 100;

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setError('');

        try {
            setCurrentStep('uploading-file');
            setStatusText('Uploading the file...');
            const uploadedFileResult = await fs.upload([file]);
            
            // Handle both single FSItem and array responses
            const uploadedFile = Array.isArray(uploadedFileResult) ? uploadedFileResult[0] : uploadedFileResult;
            if(!uploadedFile || !uploadedFile.path) {
              console.error('Upload result:', uploadedFileResult);
              throw new Error('Failed to upload file - no path in response');
            }
            console.log('✅ PDF uploaded to:', uploadedFile.path);

            setCurrentStep('converting-image');
            setStatusText('Converting PDF to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) throw new Error('Failed to convert PDF to image');
            console.log('✅ Image conversion successful, file size:', imageFile.file.size, 'bytes');

            setCurrentStep('uploading-image');
            setStatusText('Uploading image preview...');
            const uploadedImageResult = await fs.upload([imageFile.file]);
            
            // Handle both single FSItem and array responses
            const uploadedImage = Array.isArray(uploadedImageResult) ? uploadedImageResult[0] : uploadedImageResult;
            if(!uploadedImage || !uploadedImage.path) {
              console.error('Image upload result:', uploadedImageResult);
              throw new Error('Failed to upload image - no path in response');
            }
            console.log('✅ Image uploaded to:', uploadedImage.path);

            setCurrentStep('preparing-data');
            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: '',
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setCurrentStep('analyzing');
            setStatusText('Running AI analysis...');

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if (!feedback) throw new Error('Failed to analyze resume');

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            data.feedback = JSON.parse(feedbackText);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setCurrentStep('complete');
            setStatusText('✨ Analysis complete!');
            
            // Redirect after a brief delay
            setTimeout(() => navigate(`/resume/${uuid}`), 1500);
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
            setCurrentStep(null);
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) {
            setError('Please select a PDF file');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <div className="space-y-8">
                            <h2 className="text-2xl text-center">{statusText}</h2>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-linear-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Step Indicators */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {steps.map((step, idx) => (
                                    <div key={step.id} className="text-center">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-xl mb-2 transition-all ${
                                            stepIndex > idx ? 'bg-green-500 text-white' :
                                            stepIndex === idx ? 'bg-blue-500 text-white animate-pulse' :
                                            'bg-gray-200 text-gray-400'
                                        }`}>
                                            {stepIndex > idx ? '✓' : step.icon}
                                        </div>
                                        <p className={`text-xs ${stepIndex >= idx ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                            {step.label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <img src="/images/resume-scan.gif" className="w-full rounded-lg" />
                        </div>
                    ) : (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 font-medium flex items-center gap-2">
                                        <span className="text-xl">⚠️</span>
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                                <div className="form-div">
                                    <label htmlFor="company-name">Company Name <span className="text-gray-400 text-sm">(optional)</span></label>
                                    <input type="text" name="company-name" placeholder="e.g., Google, Microsoft" id="company-name" />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-title">Job Title <span className="text-gray-400 text-sm">(optional)</span></label>
                                    <input type="text" name="job-title" placeholder="e.g., Senior Software Engineer" id="job-title" />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-description">Job Description <span className="text-gray-400 text-sm">(optional)</span></label>
                                    <textarea rows={5} name="job-description" placeholder="Paste the job description here..." id="job-description" />
                                </div>

                                <div className="form-div">
                                    <label htmlFor="uploader">Upload Resume (PDF) <span className="text-red-500">*</span></label>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                    {file && (
                                        <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                                            <span>✓</span> {file.name} selected
                                        </p>
                                    )}
                                </div>

                                <button className="primary-button mt-4 hover:shadow-lg transition-shadow" type="submit">
                                    🚀 Analyze Resume
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload