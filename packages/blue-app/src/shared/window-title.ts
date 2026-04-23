export function getWindowTitle(filePath: string | null): string {
  if (!filePath) {
    return 'Blue';
  }

  const fileName = filePath.split(/[\\/]/).pop() ?? filePath;
  return `Blue - ${fileName}`;
}
