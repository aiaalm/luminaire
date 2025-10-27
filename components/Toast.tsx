
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const baseClasses = "flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg";
    const typeClasses = {
        success: "text-green-500 bg-green-100",
        error: "text-red-500 bg-red-100",
    };
    const iconPaths = {
        success: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z",
        error: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z",
    };

    return (
        <div className={baseClasses} role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses[toast.type]} rounded-lg`}>
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d={iconPaths[toast.type]}/>
                </svg>
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                onClick={() => onClose(toast.id)}
            >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, setToasts }) => {
    const handleClose = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <div className="fixed top-5 right-5 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={handleClose} />
            ))}
        </div>
    );
};
