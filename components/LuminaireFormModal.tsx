
import React, { useState, useEffect } from 'react';
import { Luminaire } from '../types';
import * as C from '../constants';

interface LuminaireFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (luminaire: Luminaire) => void;
    luminaire: Luminaire | null;
}

const initialFormState: Omit<Luminaire, 'id'> = {
    quantite: 1,
    numero_type: '',
    type_luminaire: C.TYPE_LUMINAIRE_OPTIONS[0],
    situation_pose: C.SITUATION_POSE_OPTIONS[0],
    type_support: C.TYPE_SUPPORT_OPTIONS[0],
    type_source_lumineuse: C.TYPE_SOURCE_LUMINEUSE_OPTIONS[0],
    affectation_luminaire: C.AFFECTATION_LUMINAIRE_OPTIONS[0],
    moyen_levage: C.MOYEN_LEVAGE_OPTIONS[0],
};

export const LuminaireFormModal: React.FC<LuminaireFormModalProps> = ({ isOpen, onClose, onSave, luminaire }) => {
    const [formState, setFormState] = useState(initialFormState);
    const [autreValues, setAutreValues] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (luminaire) {
            setFormState(luminaire);
        } else {
            setFormState(initialFormState);
        }
        setAutreValues({});
    }, [luminaire, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: name === 'quantite' ? parseInt(value, 10) || 0 : value }));
    };
    
    const handleAutreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAutreValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let finalNumeroType = formState.numero_type;
        const autresPrecisions: string[] = [];

        if (formState.type_luminaire === C.AUTRE_PRECISER && autreValues.type_luminaire) {
             autresPrecisions.push(`type: ${autreValues.type_luminaire}`);
        }
        if (formState.type_support === C.AUTRE_PRECISER && autreValues.type_support) {
            autresPrecisions.push(`support: ${autreValues.type_support}`);
        }
        if (formState.type_source_lumineuse === C.AUTRE_PRECISER && autreValues.type_source_lumineuse) {
            autresPrecisions.push(`source: ${autreValues.type_source_lumineuse}`);
        }
        if (formState.affectation_luminaire === C.AUTRE_PRECISER && autreValues.affectation_luminaire) {
            autresPrecisions.push(`affectation: ${autreValues.affectation_luminaire}`);
        }
        
        if (autresPrecisions.length > 0) {
            finalNumeroType = `${finalNumeroType} (${autresPrecisions.join('; ')})`;
        }

        onSave({ ...formState, id: luminaire?.id || '', numero_type: finalNumeroType });
    };

    const renderSelect = (name: keyof Omit<Luminaire, 'id' | 'quantite' | 'numero_type'>, label: string, options: string[]) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <select
                id={name}
                name={name}
                value={formState[name]}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {formState[name] === C.AUTRE_PRECISER && (
                 <input
                    type="text"
                    name={name}
                    placeholder="Précisez..."
                    onChange={handleAutreChange}
                    className="mt-2 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
                 />
            )}
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-primary">{luminaire ? 'Modifier' : 'Ajouter'} un luminaire</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantite" className="block text-sm font-medium text-gray-700">Quantité</label>
                            <input
                                type="number"
                                id="quantite"
                                name="quantite"
                                value={formState.quantite}
                                onChange={handleChange}
                                min="0"
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="numero_type" className="block text-sm font-medium text-gray-700">N° du type (ex: LT-23)</label>
                            <input
                                type="text"
                                id="numero_type"
                                name="numero_type"
                                value={formState.numero_type}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderSelect('type_luminaire', 'Type de luminaire', C.TYPE_LUMINAIRE_OPTIONS)}
                        {renderSelect('situation_pose', 'Situation de pose', C.SITUATION_POSE_OPTIONS)}
                        {renderSelect('type_support', 'Type de support', C.TYPE_SUPPORT_OPTIONS)}
                        {renderSelect('type_source_lumineuse', 'Type de source lumineuse', C.TYPE_SOURCE_LUMINEUSE_OPTIONS)}
                        {renderSelect('affectation_luminaire', 'Affectation du luminaire', C.AFFECTATION_LUMINAIRE_OPTIONS)}
                        {renderSelect('moyen_levage', 'Moyen de levage', C.MOYEN_LEVAGE_OPTIONS)}
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
