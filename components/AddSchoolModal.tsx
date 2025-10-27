import React, { useState, useEffect, useRef } from 'react';

interface AddSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Créer une nouvelle école
                        </h3>
                        <div className="mt-4">
                            <label htmlFor="school-name" className="block text-sm font-medium text-gray-700">
                                Nom de l'école
                            </label>
                            <input
                                type="text"
                                id="school-name"
                                ref={inputRef}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                required
                                placeholder="ex: École du Centre"
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            disabled={!name.trim()}
                        >
                            Créer
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
