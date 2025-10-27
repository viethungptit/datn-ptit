import { useState, useEffect } from "react";
import ColumnEditor from "./ColumnEditor";

interface Row {
    id: string;
    colSpan: number;
    columns: Column[];
}
interface Column {
    id: string;
    sections: string[];
    colSpan?: number;
}
interface RowEditorProps {
    row: Row;
    columnsCount: number;
    onChange: (row: Row) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    usedSections: string[];
    idx: number;
    totalRows: number;
}
function RowEditor({ row, onChange, onDelete, onMoveUp, onMoveDown, usedSections, idx, totalRows }: RowEditorProps) {
    const [cols, setCols] = useState<Column[]>(row.columns);
    useEffect(() => {
        onChange({ ...row, columns: cols });
    }, [cols]);

    function updateCol(colIdx: number, newCol: Column) {
        const newCols = cols.slice();
        newCols[colIdx] = newCol;
        setCols(newCols);
    }
    function deleteCol(colIdx: number) {
        setCols(cols.filter((_, i) => i !== colIdx));
    }
    function moveCol(colIdx: number, dir: number) {
        const newCols = cols.slice();
        const target = colIdx + dir;
        if (target < 0 || target >= newCols.length) return;
        [newCols[colIdx], newCols[target]] = [newCols[target], newCols[colIdx]];
        setCols(newCols);
    }

    return (
        <div className="border rounded p-2 mb-2 text-sm">
            <div className="flex items-center mb-2">
                <span className="font-medium">Dòng {idx + 1}</span>
                <button className="ml-2 btn btn-danger" onClick={onDelete}><i className="fa-solid fa-trash"></i></button>
                <button className={`ml-2 btn btn-secondary ${idx === 0 ? 'hidden' : ''}`} onClick={onMoveUp}><i className="fa-lg fa-solid fa-caret-up"></i></button>
                <button className={`ml-2 btn btn-secondary ${idx === totalRows - 1 ? 'hidden' : ''}`} onClick={onMoveDown}><i className="fa-lg fa-solid fa-caret-down"></i></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {cols.map((col, colIdx) => (
                    <ColumnEditor
                        key={col.id}
                        col={col}
                        onChange={(newCol) => updateCol(colIdx, newCol)}
                        onDelete={() => deleteCol(colIdx)}
                        onMoveUp={() => moveCol(colIdx, -1)}
                        onMoveDown={() => moveCol(colIdx, 1)}
                        usedSections={usedSections}
                        idx={colIdx}
                        totalCols={cols.length}
                    />
                ))}
            </div>
        </div>
    );
}
export default RowEditor;
