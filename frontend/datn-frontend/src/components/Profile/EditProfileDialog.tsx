import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from '../ui/select';
import { updateCurrentUserApi, upsertCandidateApi } from '../../api/userApi';
import FilePickerDialog from '../FilePicker/FilePickerDialog';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';

type Profile = any;

const EditProfileDialog: React.FC<{ profile: Profile | null; onSaved?: () => void }> = ({ profile, onSaved }) => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    // Errors are shown via react-toastify

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (!profile) return;
        setFullName(profile.fullName || '');
        setPhone(profile.phone || '');
        const cand = profile.candidate || {};
        setDob(cand.dob ? cand.dob.split('T')[0] : cand.dob || '');
        setGender(cand.gender || '');
        setAddress(cand.address || '');
        setAvatarUrl(cand.avatarUrl || '');
    }, [profile, open]);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);

        const userPayload: { fullName?: string; phone?: string } = {};
        if ((fullName || '') !== (profile.fullName || '')) userPayload.fullName = fullName || undefined;
        if ((phone || '') !== (profile.phone || '')) userPayload.phone = phone || undefined;

        const cand = profile.candidate || {};
        const candidatePayload: { dob?: string; gender?: string; address?: string; avatarUrl?: string } = {};
        if ((dob || '') !== (cand.dob ? cand.dob.split('T')[0] : cand.dob || '')) candidatePayload.dob = dob || undefined;
        if ((gender || '') !== (cand.gender || '')) candidatePayload.gender = gender || undefined;
        if ((address || '') !== (cand.address || '')) candidatePayload.address = address || undefined;
        if ((avatarUrl || '') !== (cand.avatarUrl || '')) candidatePayload.avatarUrl = avatarUrl || undefined;

        try {
            const promises: Promise<any>[] = [];
            if (Object.keys(userPayload).length > 0) {
                const payload = Object.fromEntries(Object.entries(userPayload).filter(([_, v]) => v !== undefined));
                promises.push(updateCurrentUserApi(payload));
            }
            if (Object.keys(candidatePayload).length > 0) {
                const payload = Object.fromEntries(Object.entries(candidatePayload).filter(([_, v]) => v !== undefined));
                promises.push(upsertCandidateApi(payload as any));
            }

            if (promises.length === 0) {
                setOpen(false);
                return;
            }

            const results = await Promise.allSettled(promises);
            const anyRejected = results.some(r => r.status === 'rejected');
            if (anyRejected) {
                toast.error('Có lỗi xảy ra khi lưu. Vui lòng thử lại.');
                return;
            }

            setOpen(false);
            onSaved && onSaved();
        } catch (err) {
            console.error(err);
            toast.error('Có lỗi xảy ra khi lưu.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Chỉnh sửa<i className="fa-solid fa-pen-to-square"></i></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                    <DialogDescription>Thay đổi thông tin người dùng. Nhấn Lưu để cập nhật các trường đã thay đổi.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                        <Label>Họ và tên</Label>
                        <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div>
                        <Label>Ngày sinh</Label>
                        <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                    </div>
                    <div>
                        <Label>Giới tính</Label>
                        <Select value={gender} onValueChange={(v: string) => setGender(v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Địa chỉ</Label>
                        <Input value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <Label>Avatar (URL)</Label>
                        <div className="flex items-center gap-2">
                            <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
                            <FilePickerDialog onSelect={(url) => setAvatarUrl(url)} trigger={<Button variant="outline" size="sm">Chọn ảnh</Button>} contentClassName="max-w-2xl" />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <img src={avatarUrl ? `${MINIO_ENDPOINT}/datn/${avatarUrl}` : '/avatar-default.svg'} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
                        </div>
                    </div>
                </div>

                {/* Errors are displayed via toast notifications */}

                <DialogFooter className="mt-4">
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm">Hủy</Button>
                        </DialogClose>
                        <Button onClick={handleSave} disabled={saving} size="sm">{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileDialog;
