import React, { useState, useEffect } from 'react';

interface DeleteSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    ecoleName: string;
}

const CONFIRMATION_TEXT = "JE SUIS SUR";

export const DeleteSchoolModal: React.FC<DeleteSchoolModalProps> = ({ isOpen, onClose, onConfirm, ecoleName }) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isConfirmed = inputValue === CONFIRMATION_TEXT;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Supprimer l'école "{ecoleName}"
                            </h3>
                            <div className="mt-4 space-y-3">
                                <p className="text-sm text-gray-600">
                                    Cette action est définitive et supprimera toutes les données associées (étages, locaux, luminaires).
                                </p>
                                <p className="text-sm text-gray-800 font-medium">
                                    Pour confirmer, veuillez taper <code className="bg-red-100 text-red-700 font-bold p-1 rounded">{CONFIRMATION_TEXT}</code> dans le champ ci-dessous.
                                </p>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none disabled:bg-red-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                    >
                        Supprimer définitivement
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};
