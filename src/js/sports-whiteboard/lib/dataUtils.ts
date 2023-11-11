
export function urlToBlob(dataurl: string): Blob {
    let [mime, data] = dataurl.split(',');
    mime = mime.match(/:(.*?);/)![1];
    const buffer = Buffer.from(data, 'base64');
    return new Blob([buffer], { type: mime });
}