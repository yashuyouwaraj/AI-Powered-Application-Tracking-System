import {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
    })

    const file = acceptedFiles[0] || null;



    return (
        <div {...getRootProps()} className="w-full">
            <input {...getInputProps()} />

            {file ? (
                <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                    <img src="/images/pdf.png" alt="pdf" className="size-10" />
                    <div className="flex items-center space-x-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                {file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {formatSize(file.size)}
                            </p>
                        </div>
                    </div>
                    <button className="p-2 cursor-pointer" onClick={(e) => {
                        onFileSelect?.(null)
                    }}>
                        <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="w-full px-6 py-8 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer bg-white/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-indigo-100">
                            <span className="text-2xl">📤</span>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-semibold text-gray-800">
                                Upload Resume
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Click to browse or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                PDF files only (max {formatSize(maxFileSize)})
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default FileUploader