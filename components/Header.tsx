import React from 'react';
import { Ecole } from '../types';

interface HeaderProps {
    onExportExcel: () => void;
    ecoles: Pick<Ecole, 'id' | 'nom'>[];
    selectedEcoleId: string | null;
    onSelectEcole: (id: string | null) => void;
    onAddEcole: () => void;
    onDeleteEcole: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onExportExcel,
    ecoles,
    selectedEcoleId,
    onSelectEcole,
    onAddEcole,
    onDeleteEcole 
}) => {
    
    return (
        <header className="bg-brand-primary text-white shadow-lg p-3 flex justify-between items-center flex-shrink-0 flex-wrap gap-2">
            <h1 className="text-2xl font-bold">Relevés de Luminaires</h1>
            
            <div className="flex items-center space-x-2 bg-brand-secondary p-2 rounded-lg">
                <label htmlFor="school-select" className="font-medium">École:</label>
                <select 
                    id="school-select"
                    value={selectedEcoleId ?? ''} 
                    onChange={e => onSelectEcole(e.target.value || null)}
                    className="bg-brand-light text-brand-primary font-semibold rounded-md py-1 px-2 border-2 border-transparent focus:outline-none focus:border-white"
                >
                    <option value="">-- Sélectionner --</option>
                    {ecoles.map(ecole => <option key={ecole.id} value={ecole.id}>{ecole.nom}</option>)}
                </select>
                <button onClick={onAddEcole} className="btn-header" title="Créer une nouvelle école">+</button>
                <button onClick={onDeleteEcole} disabled={!selectedEcoleId} className="btn-header" title="Supprimer l'école sélectionnée">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>

            <div className="flex items-center space-x-2">
                <button onClick={onExportExcel} disabled={!selectedEcoleId} className="btn-header">Exporter XLSX</button>
            </div>
             <style>{`
                .btn-header {
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    background-color: #0a9396;
                    color: white;
                    font-weight: 500;
                    transition: background-color 0.2s, opacity 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-header:hover {
                    background-color: #005f73;
                }
                .btn-header:disabled {
                    background-color: #005f73;
                    opacity: 0.5;
                    cursor: not-allowed;
                }
             `}</style>
        </header>
    );
};
