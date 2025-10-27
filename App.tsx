import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RootData, Ecole, Etage, Local, Luminaire, EntityType, ToastMessage } from './types';
import * as C from './constants';
import { LuminaireFormModal } from './components/LuminaireFormModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { DeleteSchoolModal } from './components/DeleteSchoolModal';
import { AddSchoolModal } from './components/AddSchoolModal';

declare const XLSX: any;

const APP_STORAGE_KEY = 'luminaireAppData';

const App: React.FC = () => {
    const [data, setData] = useState<RootData>(() => {
        try {
            const savedData = localStorage.getItem(APP_STORAGE_KEY);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
        return { ecoles: [] };
    });

    const [selectedEcoleId, setSelectedEcoleId] = useState<string | null>(null);
    const [selectedEtageId, setSelectedEtageId] = useState<string | null>(null);
    const [selectedLocalId, setSelectedLocalId] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [luminaireToEdit, setLuminaireToEdit] = useState<Luminaire | null>(null);
    
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<{ type: EntityType, id: string, parentId?: string, name: string } | null>(null);
    
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    const [addingType, setAddingType] = useState<Exclude<EntityType, 'luminaire' | 'ecole'> | null>(null);
    const [deleteSchoolModalOpen, setDeleteSchoolModalOpen] = useState(false);
    const [addSchoolModalOpen, setAddSchoolModalOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [data]);


    const addToast = useCallback((type: 'success' | 'error', message: string) => {
        setToasts(prev => [...prev, { id: Date.now(), type, message }]);
    }, []);

    const selectedEcole = useMemo(() => data.ecoles.find(e => e.id === selectedEcoleId) || null, [data.ecoles, selectedEcoleId]);
    const selectedEtage = useMemo(() => selectedEcole?.etages.find(et => et.id === selectedEtageId) || null, [selectedEcole, selectedEtageId]);
    const selectedLocal = useMemo(() => selectedEtage?.locaux.find(l => l.id === selectedLocalId) || null, [selectedEtage, selectedLocalId]);

    const handleSelectEcole = (id: string | null) => {
        setSelectedEcoleId(id);
        setSelectedEtageId(null);
        setSelectedLocalId(null);
        setAddingType(null);
    };

    const handleSelectEtage = (id: string | null) => {
        setSelectedEtageId(id);
        setSelectedLocalId(null);
        setAddingType(null);
    };

    const handleSelectLocal = (id: string | null) => {
        setSelectedLocalId(id);
        setAddingType(null);
    };
    
    // --- CRUD Operations ---
    
    const handleAddEcole = () => {
        setAddSchoolModalOpen(true);
    };

    const executeAddEcole = (name: string) => {
        const trimmedName = name.trim();
        if (trimmedName.length === 0) {
            addToast('error', "Le nom de l'école ne peut pas être vide.");
            return;
        }

        const newEcole: Ecole = { id: crypto.randomUUID(), nom: trimmedName, etages: [] };
        setData(prev => ({ ecoles: [...prev.ecoles, newEcole] }));
        handleSelectEcole(newEcole.id);
        addToast('success', `École '${trimmedName}' créée avec succès.`);
        setAddSchoolModalOpen(false);
    };

    const handleDeleteEcole = () => {
        if (selectedEcole) {
            setDeleteSchoolModalOpen(true);
        } else {
            addToast('error', "Aucune école n'est sélectionnée pour la suppression.");
        }
    };

    const executeDeleteEcole = () => {
        if (!selectedEcole) return;
        
        const schoolName = selectedEcole.nom;
        setData(prev => ({
            ecoles: prev.ecoles.filter(e => e.id !== selectedEcoleId)
        }));
        
        handleSelectEcole(null);
        setDeleteSchoolModalOpen(false);
        addToast('success', `L'école '${schoolName}' a été supprimée.`);
    };

    const executeAddItem = (type: Exclude<EntityType, 'luminaire' | 'ecole'>, name: string) => {
        if (!name || name.trim().length === 0) {
            addToast('error', 'Le nom ne peut pas être vide.');
            return;
        }
        
        const newItem = { id: crypto.randomUUID(), nom: name.trim() };

        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            switch (type) {
                case 'etage': {
                    const ecole = newData.ecoles.find((e: Ecole) => e.id === selectedEcoleId);
                     if (ecole) {
                        ecole.etages.push({ ...newItem, locaux: [] });
                    } else {
                        addToast('error', "Aucune école n'est sélectionnée.");
                        return prev;
                    }
                    break;
                }
                case 'local': {
                    const ecole = newData.ecoles.find((e: Ecole) => e.id === selectedEcoleId);
                    const etage = ecole?.etages.find((et: Etage) => et.id === selectedEtageId);
                    if (etage) {
                        etage.locaux.push({ ...newItem, luminaires: [] });
                    } else {
                        addToast('error', "Aucun étage n'est sélectionné.");
                        return prev;
                    }
                    break;
                }
            }
            return newData;
        });
        addToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} '${name}' créé.`);
        setAddingType(null);
    };

    const confirmDelete = (type: EntityType, id: string, name: string) => {
        if (type === 'ecole') return; // Schools have a different delete flow
        setDeleteAction({ type, id, name });
        setConfirmModalOpen(true);
    };

    const executeDelete = () => {
        if (!deleteAction) return;
        const { type, id } = deleteAction;

        setData(prev => {
            const newData: RootData = JSON.parse(JSON.stringify(prev));
            switch(type) {
                case 'etage': {
                    const ecole = newData.ecoles.find((e: Ecole) => e.id === selectedEcoleId);
                    if (ecole) ecole.etages = ecole.etages.filter((et: Etage) => et.id !== id);
                    if (selectedEtageId === id) handleSelectEtage(null);
                    break;
                }
                case 'local': {
                    const ecole = newData.ecoles.find((e: Ecole) => e.id === selectedEcoleId);
                    const etage = ecole?.etages.find((et: Etage) => et.id === selectedEtageId);
                    if (etage) etage.locaux = etage.locaux.filter((l: Local) => l.id !== id);
                    if (selectedLocalId === id) handleSelectLocal(null);
                    break;
                }
                case 'luminaire': {
                    const ecole = newData.ecoles.find((e: Ecole) => e.id === selectedEcoleId);
                    const etage = ecole?.etages.find((et: Etage) => et.id === selectedEtageId);
                    const local = etage?.locaux.find((l: Local) => l.id === selectedLocalId);
                    if (local) local.luminaires = local.luminaires.filter((lum: Luminaire) => lum.id !== id);
                    break;
                }
            }
            return newData;
        });
        addToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} '${deleteAction.name}' supprimé.`);
        setConfirmModalOpen(false);
        setDeleteAction(null);
    };

    const handleSaveLuminaire = (luminaire: Luminaire) => {
        setData(prev => {
            const newData: RootData = JSON.parse(JSON.stringify(prev));
            const local = newData.ecoles
                .find(e => e.id === selectedEcoleId)?.etages
                .find(et => et.id === selectedEtageId)?.locaux
                .find(l => l.id === selectedLocalId);

            if (!local) {
                addToast('error', "Local non trouvé.");
                return prev;
            }

            if (luminaireToEdit) { // Editing
                const index = local.luminaires.findIndex(l => l.id === luminaire.id);
                if (index > -1) {
                    local.luminaires[index] = luminaire;
                    addToast('success', `Luminaire '${luminaire.numero_type}' mis à jour.`);
                }
            } else { // Creating
                local.luminaires.push({ ...luminaire, id: crypto.randomUUID() });
                addToast('success', `Nouveau luminaire '${luminaire.numero_type}' ajouté.`);
            }
            return newData;
        });
        setModalOpen(false);
        setLuminaireToEdit(null);
    };
    
    const openLuminaireModal = (luminaire: Luminaire | null) => {
        setLuminaireToEdit(luminaire);
        setModalOpen(true);
    };

    // --- Data Import / Export ---
    const handleExportExcel = () => {
        if (!selectedEcole) {
            addToast('error', 'Veuillez sélectionner une école à exporter.');
            return;
        }

        const workbook = XLSX.utils.book_new();

        if (selectedEcole.etages.length === 0) {
            addToast('error', "Cette école n'a pas d'étages à exporter.");
            return;
        }

        selectedEcole.etages.forEach(etage => {
            const wsData: (string|number)[][] = [];

            // --- Static Header Content ---
            wsData[0] = []; wsData[0][0] = 'Liste des locaux';
            wsData[0][48] = 'RHÔNELECTRA ENGINEERING';
            wsData[1] = []; wsData[1][48] = 'page n°';
            wsData[2] = []; wsData[2][0] = 'Désignation du site :'; wsData[2][3] = selectedEcole.nom;
            
            wsData[2][28] = 'Conditions du relevé :';
            const conditions = [
                '- visuelle uniquement et sans outil particulier',
                '- pas de manœuvre sur les raccordements électriques',
                '- pas de démontage, ni manutention de faux-plafond admis',
                '- seuls les diffuseurs et sources lumineuses peuvent être manipulés',
                '- démontage des downlight pour accès au diamètre d’encastrement si les conditions le permettent',
                '- consignes de sécurité à respecter et mise en œuvre dans le cadre de travaux en hauteur'
            ];
            conditions.forEach((cond, i) => {
                wsData[3 + i] = wsData[3 + i] || [];
                wsData[3 + i][28] = cond;
            });

            wsData[2][14] = 'Niveau examiné';
            wsData[3] = wsData[3] || [];
            wsData[3][14] = 'No du niveau'; wsData[3][16] = 'Niveau';
            const niveaux = ['sous-sol', 'rez', 'rez inf', 'rez sup', 'étage', 'autre'];
            niveaux.forEach((niveau, i) => {
                wsData[4 + i] = wsData[4 + i] || [];
                if (etage.nom.toLowerCase().includes(niveau)) {
                    wsData[4 + i][14] = 'x';
                }
                wsData[4 + i][16] = niveau;
            });
            
            wsData[9] = wsData[9] || []; wsData[9][28] = 'Observations :';
            
            // --- Main Table Headers (at row 12, index 11) ---
            const headerGroups = [
                { name: 'Type de luminaire', options: C.TYPE_LUMINAIRE_OPTIONS, key: 'type_luminaire' },
                { name: 'Situation de pose', options: C.SITUATION_POSE_OPTIONS, key: 'situation_pose' },
                { name: 'Type de support', options: C.TYPE_SUPPORT_OPTIONS, key: 'type_support' },
                { name: 'Type de source lumineuse', options: C.TYPE_SOURCE_LUMINEUSE_OPTIONS, key: 'type_source_lumineuse' },
                { name: 'Affectation du luminaire', options: C.AFFECTATION_LUMINAIRE_OPTIONS, key: 'affectation_luminaire' },
                { name: 'Moyen levage', options: C.MOYEN_LEVAGE_OPTIONS, key: 'moyen_levage' },
            ];

            const staticHeaders = ['N° de la salle\nou description', 'Quantité de luminaires', 'N° du luminaire-type'];
            const headerRow1 = [...staticHeaders.map(() => '')];
            const headerRow2 = [...staticHeaders];
            const merges = [];
            let currentCol = staticHeaders.length;

            headerGroups.forEach(group => {
                headerRow1.push(group.name);
                for (let i = 1; i < group.options.length; i++) headerRow1.push('');
                headerRow2.push(...group.options);
                if (group.options.length > 1) {
                    merges.push({ s: { r: 11, c: currentCol }, e: { r: 11, c: currentCol + group.options.length - 1 } });
                }
                currentCol += group.options.length;
            });

            wsData[11] = headerRow1;
            wsData[12] = headerRow2;

            // --- Main Table Data ---
            const luminairesFlat: (Partial<Luminaire> & {local_nom: string})[] = [];
            etage.locaux.forEach(local => {
                if (local.luminaires.length > 0) {
                    local.luminaires.forEach(luminaire => {
                        luminairesFlat.push({
                            local_nom: local.nom,
                            ...luminaire
                        });
                    });
                } else {
                     luminairesFlat.push({
                        local_nom: local.nom,
                        quantite: 0, numero_type: '', type_luminaire: '', situation_pose: '',
                        type_support: '', type_source_lumineuse: '', affectation_luminaire: '', moyen_levage: ''
                    });
                }
            });

            const dataAoA = luminairesFlat.map(lum => {
                const row: (string|number)[] = [];
                row.push(lum.local_nom);
                row.push(lum.quantite || '');
                row.push(lum.numero_type || '');

                headerGroups.forEach(group => {
                    const value = lum[group.key as keyof typeof lum] as string;
                    group.options.forEach(option => {
                        row.push(option === value ? 'x' : '');
                    });
                });
                return row;
            });
            
            // Add at least 20 empty rows for data as per image, if less data exists
            const emptyRowCount = 20 - dataAoA.length;
            const finalData = [...dataAoA];
            if(emptyRowCount > 0) {
                for (let i = 0; i < emptyRowCount; i++) {
                    finalData.push([]);
                }
            }
            wsData.push(...finalData);
            
            const worksheet = XLSX.utils.aoa_to_sheet(wsData);

            // Header Merges
            merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }); // Liste des locaux
            merges.push({ s: { r: 2, c: 14 }, e: { r: 2, c: 20 } }); // Niveau examiné
            merges.push({ s: { r: 2, c: 28 }, e: { r: 2, c: 47 } }); // Conditions
            worksheet['!merges'] = merges;
            
            const colWidths = headerRow2.map((h, i) => {
                if (i === 0) return { wch: 30 };
                if (i === 1) return { wch: 10 };
                if (i === 2) return { wch: 20 };
                return { wch: h.length > 5 ? h.length : 5 };
            });
            worksheet['!cols'] = colWidths;

            // --- Add Borders ---
            const thin = { style: 'thin', color: { rgb: 'FF000000' } };
            const medium = { style: 'medium', color: { rgb: 'FF000000' } };
            const mediumBorderCols = [2, 19, 25, 35, 48, 50];

            function applyBorderStyle(ws: any, r: number, c: number, style: any) {
                const cellRef = XLSX.utils.encode_cell({ r, c });
                let cell = ws[cellRef];
                if (!cell) {
                    ws[cellRef] = { t: 's', v: '' };
                    cell = ws[cellRef];
                }
                if (!cell.s) cell.s = {};
                cell.s.border = { ...cell.s.border, ...style };
            }

            // Main data table grid
            const headerRowCount = 13;
            const dataRowCount = finalData.length;
            const totalRows = headerRowCount + dataRowCount;

            for (let r = 11; r < totalRows; r++) {
                for (let c = 0; c <= 50; c++) {
                    applyBorderStyle(worksheet, r, c, {
                        top: thin, bottom: thin, left: thin, right: thin
                    });
                    if (mediumBorderCols.includes(c)) {
                        applyBorderStyle(worksheet, r, c, { right: medium });
                    }
                     if (c > 0 && mediumBorderCols.includes(c - 1)) {
                        applyBorderStyle(worksheet, r, c, { left: medium });
                    }
                }
            }
            
            // Other sections
            const sections = [
                { r1: 2, r2: 9, c1: 13, c2: 17 }, // Niveau examiné
                { r1: 2, r2: 8, c1: 28, c2: 51 }, // Conditions
                { r1: 9, r2: 10, c1: 28, c2: 51 }, // Observations
            ];
            
            sections.forEach(sec => {
                 for (let r = sec.r1; r <= sec.r2; r++) {
                    for (let c = sec.c1; c <= sec.c2; c++) {
                        const border: any = {};
                        if (r === sec.r1) border.top = thin;
                        if (r === sec.r2) border.bottom = thin;
                        if (c === sec.c1) border.left = thin;
                        if (c === sec.c2) border.right = thin;
                        if (r > sec.r1) border.top = { style: 'dotted', color: { rgb: 'FFB0B0B0' } };
                        applyBorderStyle(worksheet, r, c, border);
                    }
                }
            });


            XLSX.utils.book_append_sheet(workbook, worksheet, etage.nom.replace(/[\\/*?[\]]/g, '').substring(0, 31));
        });

        XLSX.writeFile(workbook, `Relevé_${selectedEcole.nom.replace(/ /g, '_')}.xlsx`);
        addToast('success', 'Fichier XLSX généré avec succès.');
    };

    return (
        <div className="h-screen w-screen flex flex-col font-sans">
            <Header 
                onExportExcel={handleExportExcel}
                ecoles={data.ecoles}
                selectedEcoleId={selectedEcoleId}
                onSelectEcole={handleSelectEcole}
                onAddEcole={handleAddEcole}
                onDeleteEcole={handleDeleteEcole}
            />
            
            <main className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
                <DataColumn 
                    title="Étages"
                    items={selectedEcole?.etages || []}
                    selectedId={selectedEtageId}
                    onSelect={handleSelectEtage}
                    onDelete={(id, name) => confirmDelete('etage', id, name)}
                    disabled={!selectedEcole}
                    isAdding={addingType === 'etage'}
                    onStartAdd={() => setAddingType('etage')}
                    onConfirmAdd={(name) => executeAddItem('etage', name)}
                    onCancelAdd={() => setAddingType(null)}
                />
                <DataColumn 
                    title="Locaux"
                    items={selectedEtage?.locaux || []}
                    selectedId={selectedLocalId}
                    onSelect={handleSelectLocal}
                    onDelete={(id, name) => confirmDelete('local', id, name)}
                    disabled={!selectedEtage}
                    isAdding={addingType === 'local'}
                    onStartAdd={() => setAddingType('local')}
                    onConfirmAdd={(name) => executeAddItem('local', name)}
                    onCancelAdd={() => setAddingType(null)}
                />
                <LuminaireView 
                    local={selectedLocal}
                    onAdd={() => openLuminaireModal(null)}
                    onEdit={openLuminaireModal}
                    onDelete={(id, name) => confirmDelete('luminaire', id, name)}
                />
            </main>

            {modalOpen && (
                <LuminaireFormModal
                    isOpen={modalOpen}
                    onClose={() => { setModalOpen(false); setLuminaireToEdit(null); }}
                    onSave={handleSaveLuminaire}
                    luminaire={luminaireToEdit}
                />
            )}
            
            {confirmModalOpen && deleteAction && (
                <ConfirmationModal 
                    isOpen={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={executeDelete}
                    itemName={deleteAction.name}
                    itemType={deleteAction.type}
                />
            )}
            
            {deleteSchoolModalOpen && selectedEcole && (
                <DeleteSchoolModal
                    isOpen={deleteSchoolModalOpen}
                    onClose={() => setDeleteSchoolModalOpen(false)}
                    onConfirm={executeDeleteEcole}
                    ecoleName={selectedEcole.nom}
                />
            )}
            
            {addSchoolModalOpen && (
                <AddSchoolModal
                    isOpen={addSchoolModalOpen}
                    onClose={() => setAddSchoolModalOpen(false)}
                    onConfirm={executeAddEcole}
                />
            )}

            <ToastContainer toasts={toasts} setToasts={setToasts} />
        </div>
    );
};

// --- Sub-components (defined outside App to prevent re-renders) ---

interface DataColumnProps {
    title: string;
    items: { id: string, nom: string }[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string, name: string) => void;
    disabled?: boolean;
    isAdding: boolean;
    onStartAdd: () => void;
    onConfirmAdd: (name: string) => void;
    onCancelAdd: () => void;
}

const DataColumn: React.FC<DataColumnProps> = ({ title, items, selectedId, onSelect, onDelete, disabled = false, isAdding, onStartAdd, onConfirmAdd, onCancelAdd }) => {
    const [name, setName] = useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isAdding) {
            inputRef.current?.focus();
        } else {
            setName('');
        }
    }, [isAdding]);

    const handleConfirm = () => {
        if (name.trim()) {
            onConfirmAdd(name.trim());
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === 'Escape') {
            onCancelAdd();
        }
    };

    return (
        <div className={`flex flex-col bg-white rounded-lg shadow-md overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
                <h2 className="text-lg font-bold text-brand-primary">{title}</h2>
                <button
                    onClick={onStartAdd}
                    disabled={disabled}
                    className="p-1.5 rounded-full bg-brand-primary text-white hover:bg-brand-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Ajouter ${title.slice(0, -1).toLowerCase()}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-2">
                {isAdding && (
                    <div className="p-2 mb-2 bg-gray-50 border rounded-md shadow-inner">
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Nom du nouveau ${title.slice(0, -1).toLowerCase()}`}
                            className="w-full px-2 py-1.5 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button onClick={onCancelAdd} className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                            <button onClick={handleConfirm} className="px-3 py-1 text-xs text-white bg-brand-primary rounded-md hover:bg-brand-secondary">Ajouter</button>
                        </div>
                    </div>
                )}
                <div className="space-y-2">
                    {items.length > 0 ? items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`group flex justify-between items-center p-2.5 rounded-md cursor-pointer transition-colors ${selectedId === item.id ? 'bg-brand-primary text-white' : 'hover:bg-brand-light'}`}
                        >
                            <span className="truncate">{item.nom}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.nom); }}
                                className={`p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ${selectedId === item.id ? 'text-white hover:bg-red-500' : ''}`}
                                aria-label={`Supprimer ${item.nom}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 p-4 text-sm">
                            {disabled ? "Sélectionnez d'abord une école." : `Aucun ${title.toLowerCase()}.`}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface LuminaireViewProps {
    local: Local | null;
    onAdd: () => void;
    onEdit: (luminaire: Luminaire) => void;
    onDelete: (id: string, name: string) => void;
}

const LuminaireView: React.FC<LuminaireViewProps> = ({ local, onAdd, onEdit, onDelete }) => {
    return (
        <div className={`flex flex-col bg-white rounded-lg shadow-md overflow-hidden ${!local ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
                <h2 className="text-lg font-bold text-brand-primary">Luminaires</h2>
                <button
                    onClick={onAdd}
                    disabled={!local}
                    className="p-1.5 rounded-full bg-brand-primary text-white hover:bg-brand-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="Ajouter un luminaire"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-2">
                {local ? (
                    local.luminaires.length > 0 ? (
                        <div className="space-y-2">
                            {local.luminaires.map(lum => (
                                <div key={lum.id} className="group bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-brand-secondary">{lum.numero_type || '(Non spécifié)'}</p>
                                            <p className="text-sm text-gray-600">Quantité: {lum.quantite}</p>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(lum)} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600" aria-label="Modifier"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                            <button onClick={() => onDelete(lum.id, lum.numero_type)} className="p-1.5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600" aria-label="Supprimer"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                                        </div>
                                    </div>
                                     <p className="text-xs text-gray-500 mt-2">{lum.type_luminaire} / {lum.type_source_lumineuse}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 p-4 text-sm">Aucun luminaire dans ce local.</p>
                    )
                ) : (
                    <p className="text-center text-gray-500 p-4 text-sm">Sélectionnez un local pour voir les luminaires.</p>
                )}
            </div>
        </div>
    );
};

export default App;
