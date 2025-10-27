import { useState, useEffect, type ChangeEvent } from "react";
import RowEditor from "./RowEditor";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

interface LayoutJson {
    layout: {
        columns: number;
        rows: Row[];
    };
}
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
interface LayoutEditorProps {
    layout: LayoutJson;
    onChange: (layout: LayoutJson) => void;
}
function LayoutEditor({ layout, onChange }: LayoutEditorProps) {
    const [rows, setRows] = useState<Row[]>(layout.layout.rows);
    const [newRowColSpan, setNewRowColSpan] = useState<number>(3);
    const [colPattern, setColPattern] = useState<string>("1-1-1");

    useEffect(() => {
        onChange({ layout: { columns: 3, rows } });
        // eslint-disable-next-line
    }, [rows]);

    function handleNewRowColSpanChange(e: ChangeEvent<HTMLSelectElement>) {
        const val = Number(e.target.value);
        setNewRowColSpan(val);
        // Reset colPattern nếu không phải 3 cột
        if (val !== 3) setColPattern("");
    }

    function addRow() {
        let columns: Column[] = [];
        if (newRowColSpan === 3) {
            if (colPattern === "2-1") {
                columns = [
                    { id: `col-${Date.now()}-0`, sections: [], colSpan: 2 },
                    { id: `col-${Date.now()}-1`, sections: [], colSpan: 1 },
                ];
            } else if (colPattern === "1-2") {
                columns = [
                    { id: `col-${Date.now()}-0`, sections: [], colSpan: 1 },
                    { id: `col-${Date.now()}-1`, sections: [], colSpan: 2 },
                ];
            } else {
                columns = Array.from({ length: 3 }, (_, i) => ({
                    id: `col-${Date.now()}-${i}`,
                    sections: [],
                    colSpan: 1,
                }));
            }
        } else {
            columns = Array.from({ length: newRowColSpan }, (_, i) => ({
                id: `col-${Date.now()}-${i}`,
                sections: [],
                colSpan: 1,
            }));
        }
        const newRow: Row = {
            id: "row-" + Date.now(),
            colSpan: newRowColSpan,
            columns,
        };
        setRows([...rows, newRow]);
    }

    function updateRow(idx: number, newRow: Row) {
        const newRows = rows.slice();
        newRows[idx] = newRow;
        setRows(newRows);
    }
    function deleteRow(idx: number) {
        setRows(rows.filter((_, i) => i !== idx));
    }
    function moveRow(idx: number, dir: number) {
        const newRows = rows.slice();
        const target = idx + dir;
        if (target < 0 || target >= newRows.length) return;
        [newRows[idx], newRows[target]] = [newRows[target], newRows[idx]];
        setRows(newRows);
    }

    // Collect all used sections in the layout
    const usedSections = rows.flatMap(row => row.columns.flatMap(col => col.sections));

    return (
        <div className="mt-4">
            <div className="mb-2 flex justify-between items-center gap-4">
                <div className="flex items-center text-sm">
                    <label className="font-semibold">Số cột của dòng mới:</label>
                    <div className="ml-2 w-24">
                        <Select value={String(newRowColSpan)} onValueChange={val => handleNewRowColSpanChange({ target: { value: val } } as ChangeEvent<HTMLSelectElement>)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn số cột" />
                            </SelectTrigger>
                            <SelectContent className="min-w-[6rem]">
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className={`flex text-sm items-center ${newRowColSpan !== 3 ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="font-semibold">Kiểu chia cột:</label>
                    <div className="ml-2 w-32">
                        <Select value={colPattern} onValueChange={setColPattern} disabled={newRowColSpan !== 3}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn kiểu" />
                            </SelectTrigger>
                            <SelectContent className="min-w-[8rem]">
                                <SelectItem value="1-1-1">1-1-1</SelectItem>
                                <SelectItem value="2-1">2-1</SelectItem>
                                <SelectItem value="1-2">1-2</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">(2-1: cột đầu chiếm 2, 1-2: cột cuối chiếm 2)</span>
                </div>
                <Button onClick={addRow}>
                    <i className="fa-xs text-sm mr-1 fa-solid fa-plus"></i>
                    Thêm dòng
                </Button>
            </div>
            <div>
                {rows.map((row, idx) => (
                    <RowEditor
                        key={row.id}
                        row={row}
                        columnsCount={row.colSpan}
                        onChange={(newRow) => updateRow(idx, newRow)}
                        onDelete={() => deleteRow(idx)}
                        onMoveUp={() => moveRow(idx, -1)}
                        onMoveDown={() => moveRow(idx, 1)}
                        usedSections={usedSections}
                        idx={idx}
                        totalRows={rows.length}
                    />
                ))}
            </div>
        </div>
    );
}
export default LayoutEditor;
