import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeConfigEditor from '@/components/CVTemplate/ThemeConfigEditor';
import LayoutEditor from '@/components/CVTemplate/LayoutEditor';
import CVPreview from '@/components/CVTemplate/CVPreview';
import { Button } from '@/components/ui/button';
import { getTemplateDetail, createTemplate, updateTemplate } from '@/api/recruitApi';
import { toast } from 'react-toastify';
import { initialData, englishInitialData } from '@/data/initialData';
import { } from 'react';
import * as htmlToImage from 'html-to-image';

interface LayoutJson {
    layout: {
        columns: number;
        rows: any[];
    };
}

interface Template {
    templateId?: string;
    name: string;
    layout_json: LayoutJson;
    theme_json: any;
}

const LOCAL_DRAFT_PREFIX = 'cv_template_draft_';

const defaultLayout = (): LayoutJson => ({ layout: { columns: 3, rows: [] } });

const defaultTheme = {
    color: '#333333',
    size: 13,
    colorTitle: '#1976d2',
    sizeTitle: 16,
    colorName: '#1976d2',
    sizeName: 24,
    colorPosition: '#1976d2',
    sizePosition: 18,
    alignTextTitle: 'left',
    alignTextName: 'center',
    alignTextPosition: 'center',
    borderRadiusAvatar: 100,
    sizeAvatar: 150,
    language: 'vi'
};

export default function CVTemplateEditor() {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const isNew = !templateId || templateId === 'new';

    const [editing, setEditing] = useState<Template | null>(null);
    const [theme, setTheme] = useState<any>(defaultTheme);
    const [loading, setLoading] = useState(false);

    const localKey = `${LOCAL_DRAFT_PREFIX}${templateId ?? 'new'}`;
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const draft = localStorage.getItem(localKey);
        if (draft) {
            try {
                const obj = JSON.parse(draft);
                setEditing(obj);
                setTheme(obj.theme_json ?? defaultTheme);
                return;
            } catch (e) {
                console.warn('failed parse draft', e);
            }
        }

        if (isNew) {
            const newTpl: Template = { name: 'Mẫu mới', layout_json: defaultLayout(), theme_json: defaultTheme };
            setEditing(newTpl);
            setTheme(defaultTheme);
            return;
        }

        const fetchTemplate = async () => {
            setLoading(true);
            try {
                const res = await getTemplateDetail(templateId as string);
                const data = res.data;
                const tpl: Template = {
                    templateId: data.templateId || data.id,
                    name: data.name,
                    layout_json: data.layoutJson ? JSON.parse(data.layoutJson) : defaultLayout(),
                    theme_json: data.themeJson ? JSON.parse(data.themeJson) : defaultTheme,
                };
                setEditing(tpl);
                setTheme(tpl.theme_json ?? defaultTheme);
            } catch (err) {
                console.error('Failed to load template', err);
                toast.error('Không thể tải template');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [templateId]);

    useEffect(() => {
        if (!editing) return;
        try {
            localStorage.setItem(localKey, JSON.stringify(editing));
        } catch (e) {
            console.warn('failed to persist draft', e);
        }
    }, [editing, localKey]);

    const handleSave = async () => {
        if (!editing) return;
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', editing.name);
            fd.append('layoutJson', JSON.stringify(editing.layout_json));
            fd.append('themeJson', JSON.stringify(editing.theme_json ?? theme));
            if (previewRef.current) {
                const blob = await htmlToImage.toBlob(previewRef.current, {
                    backgroundColor: 'white',
                    quality: 1.0,
                    pixelRatio: 2
                });
                if (blob) {
                    const randomSuffix = Date.now();
                    const file = new File([blob], `preview_${randomSuffix}.png`, { type: 'image/png' });
                    fd.append('preview', file);
                }

            }
            let res;
            if (editing.templateId) {
                res = await updateTemplate(editing.templateId, fd);
            } else {
                res = await createTemplate(fd);
            }

            // clear draft and navigate
            localStorage.removeItem(localKey);
            const saved = res?.data;
            const id = saved?.templateId || saved?.id || editing.templateId;
            toast.success('Lưu mẫu thành công');
            if (id) navigate(`/admin/templates`);
            else navigate('/admin/templates');
        } catch (err) {
            console.error('Save failed', err);
            toast.error('Lưu mẫu thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !editing) return <div className="p-4">Loading...</div>;
    if (!editing) return <div className="p-4">Không tìm thấy template</div>;

    return (
        <div className="px-4 py-2">
            <h2 className="font-semibold text-left">{isNew ? "Tạo mẫu CV mới" : "Chỉnh sửa mẫu CV"}</h2>
            <LayoutEditor
                layout={editing.layout_json}
                onChange={(l: any) => setEditing({ ...editing, layout_json: l })}
            />
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                    <ThemeConfigEditor
                        theme={theme}
                        onChange={(t: any) => { setTheme(t); setEditing({ ...editing, theme_json: t }); }}
                        templateName={editing.name}
                        onTemplateNameChange={(n: string) => setEditing({ ...editing, name: n })}
                    />
                </div>
                <div className="col-span-2" ref={previewRef}>
                    <CVPreview layout_json={editing.layout_json} initialData={(theme?.language === 'en') ? englishInitialData : initialData} theme={theme} />
                </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
                <Button variant="secondary" onClick={() => navigate('/admin/templates')}>Hủy</Button>
                <Button variant="login" onClick={handleSave}>
                    {loading ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </div>
        </div>
    );
}
