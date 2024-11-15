export const getImageUrl = (image: string | null): string => {
    if (!image) return '/assets/default-post.jpeg';
    
    // Nettoyer la chaîne base64
    const cleanImage = image.replace(/\s+/g, '');
    return cleanImage.startsWith('data:') ? cleanImage : `/images/${image}`;
}; 