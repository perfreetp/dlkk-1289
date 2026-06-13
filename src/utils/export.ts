import html2canvas from 'html2canvas';

export async function exportElementAsImage(element: HTMLElement, filename: string = 'career-summary.png'): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#FAF9F6',
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
