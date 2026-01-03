import { supabase } from "../lib/supabase";

export const uploadFile = async (
    file: File,
    bucket: string = 'card-attachments'
): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const deleteFile = async (url: string, bucket: string = 'card-attachments') => {
    try {
        const path = url.split('/').pop();
        if (!path) throw new Error('Invalid URL');

        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};