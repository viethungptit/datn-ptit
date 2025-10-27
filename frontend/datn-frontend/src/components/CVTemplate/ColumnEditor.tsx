import { useState, useEffect } from "react";
import SectionSelector from "./SectionSelector";

interface Column {
    id: string;
    sections: string[];
    colSpan?: number;
}
interface ColumnEditorProps {
    col: Column;
    onChange: (col: Column) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    usedSections: string[];
    idx: number;
    totalCols: number;
}
function ColumnEditor({ col, onChange, onMoveUp, onMoveDown, usedSections, idx, totalCols }: ColumnEditorProps) {
    const [sections, setSections] = useState<string[]>(col.sections);
    useEffect(() => {
        onChange({ ...col, sections });
        // eslint-disable-next-line
    }, [sections]);

    function addSection(section: string) {
        if (!sections.includes(section)) {
            setSections([...sections, section]);
        }
    }
    function removeSection(section: string) {
        setSections(sections.filter((s) => s !== section));
    }
    function moveSection(idx: number, dir: number) {
        const newSections = sections.slice();
        const target = idx + dir;
        if (target < 0 || target >= newSections.length) return;
        [newSections[idx], newSections[target]] = [newSections[target], newSections[idx]];
        setSections(newSections);
    }

    return (
        <div className="border rounded p-2 text-sm bg-white">
            <div className="flex items-center mb-2">
                <span className="font-medium">Cột {idx + 1}</span>
                <button className={`ml-2 btn btn-secondary ${idx === 0 ? 'hidden' : ''}`} onClick={onMoveUp}>
                    <i className="fa-lg fa-solid fa-caret-left"></i>
                </button>
                <button className={`ml-2 btn btn-secondary ${idx === totalCols - 1 ? 'hidden' : ''}`} onClick={onMoveDown}>
                    <i className="fa-lg fa-solid fa-caret-right"></i>
                </button>
            </div>
            <SectionSelector
                selected={sections}
                onAdd={addSection}
                onRemove={removeSection}
                onMove={moveSection}
                usedSections={usedSections}
            />
        </div>
    );
}
export default ColumnEditor;
