export async function loadAmiriFont(doc: any) {
  const load = async (url: string) => {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return buf;
  };

  const regular = await load('/fonts/Amiri-Regular.ttf');
  const bold = await load('/fonts/Amiri-Bold.ttf');

  doc.addFileToVFS('Amiri-Regular.ttf', regular);
  doc.addFileToVFS('Amiri-Bold.ttf', bold);

  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  doc.addFont('Amiri-Bold.ttf', 'Amiri', 'bold');
}
