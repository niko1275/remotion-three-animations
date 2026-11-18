export const keyboardX = 0;
export const keyboardZ = -.51;
export const keyPitch = .042;
const rows = [
  'ESC 1 2 3 4 5 6 7 8 9 0 - = ⌫',
  'TAB Q W E R T Y U I O P [ ] \\',
  'CAPS A S D F G H J K L ; \' ENTER',
  'SHIFT Z X C V B N M , . / SHIFT',
  'CTRL ▣ ALT SPACE ALT ▣ CTRL',
].map(row => row.split(' '));

export const keys = rows.flatMap((row, r) => {
  const widths = r === 4 ? [1.5, 1, 1, 5, 1, 1, 1.5] : row.map((_, i) => i === 0 && r > 0 ? 1 + r * .2 : 1);
  let x = -widths.reduce((sum, width) => sum + width, 0) * keyPitch / 2;
  return row.map((label, col) => {
    const width = widths[col] * keyPitch;
    const key = {label, id: r * 16 + col, x: keyboardX + x + width / 2, z: keyboardZ + (r - 2) * keyPitch, width};
    x += width;
    return key;
  });
});
export const alt = keys.find(key => key.label === 'ALT')!;
export const keyboardWidth = .64;
export const keyboardDepth = .234;
