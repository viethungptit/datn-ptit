import { SECTION_LIST } from "./constants";

interface SectionSelectorProps {
    selected: string[];
    onAdd: (section: string) => void;
    onRemove: (section: string) => void;
    onMove: (idx: number, dir: number) => void;
    usedSections: string[];
}
function SectionSelector({ selected, onAdd, onRemove, onMove, usedSections }: SectionSelectorProps) {
    return (
        <div>
            <div className="mb-2">
                <div className="flex flex-wrap gap-2 mt-1">
                    {SECTION_LIST.filter(sec => !selected.includes(sec.key) && !usedSections.includes(sec.key)).map((sec) => (
                        <button
                            key={sec.key}
                            className={`px-2 py-1 rounded border bg-gray-100 text-xs`}
                            onClick={() => onAdd(sec.key)}
                        >
                            {sec.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <ul className="mt-1">
                    {selected.map((sec, idx) => {
                        const info = SECTION_LIST.find((s) => s.key === sec);
                        return (
                            <li key={sec} className="flex items-center gap-2 mb-1">
                                <span className="p-2 rounded border text-xs bg-green-100">{info?.label || sec}
                                    <button className="btn btn-danger ml-2" onClick={() => onRemove(sec)}><i className="fa-sm fa-solid fa-trash"></i></button>
                                </span>
                                <div className="flex flex-col items-center">
                                    <button
                                        className={`${idx === 0 ? 'hidden' : ''} w-6 h-6 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40`}
                                        onClick={() => onMove(idx, -1)}
                                    >
                                        <i className="fa-solid fa-caret-up text-sm"></i>
                                    </button>
                                    <button
                                        className={`${idx === selected.length - 1 ? 'hidden' : ''} w-6 h-6 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40`}
                                        onClick={() => onMove(idx, 1)}
                                    >
                                        <i className="fa-solid fa-caret-down text-sm"></i>
                                    </button>
                                </div>

                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
export default SectionSelector;
