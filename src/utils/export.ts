import html2canvas from 'html2canvas';

export async function exportElementAsImage(element: HTMLElement, filename: string = 'career-summary.png'): Promise<void> {
  if (!element || !(element instanceof HTMLElement)) {
    console.error('exportElementAsImage: invalid element');
    return;
  }
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#FAF9F6',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: false,
      onclone: (clonedDoc) => {
        const els = clonedDoc.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
        els.forEach((el) => {
          el.removeAttribute('onclick');
          el.removeAttribute('onload');
          el.removeAttribute('onerror');
          el.removeAttribute('onmouseover');
        });
      },
    });
    const link = document.createElement('a');
    link.download = String(filename || 'career-summary.png').replace(/[^a-zA-Z0-9_.-]/g, '_');
    link.href = canvas.toDataURL('image/png');
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('exportElementAsImage failed:', e);
  }
}

export function formatDate(iso: string): string {
  if (!iso || typeof iso !== 'string') return '未知日期';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '未知日期';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  } catch (e) {
    return '未知日期';
  }
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  try {
    return classes.filter((c) => typeof c === 'string' && c.trim().length > 0).join(' ');
  } catch (e) {
    return '';
  }
}
