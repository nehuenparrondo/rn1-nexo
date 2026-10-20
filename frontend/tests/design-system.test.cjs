const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function theme(platform) {
  const source = fs.readFileSync(
    path.join(__dirname, '../src/theme.ts'),
    'utf8',
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.equal(name, 'react-native');
      return { Platform: { OS: platform } };
    },
  });
  return exports;
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

for (const mode of ['light', 'dark']) {
  test(`${mode}: texto, enlaces y mensajes alcanzan contraste AA`, () => {
    const colors = theme('web').palettes[mode];
    for (const foreground of [
      'text',
      'secondary',
      'accent',
      'danger',
      'success',
    ]) {
      for (const background of ['surface', 'background', 'muted']) {
        assert.ok(
          contrast(colors[foreground], colors[background]) >= 4.5,
          `${foreground} sobre ${background}`,
        );
      }
    }
  });
  test(`${mode}: los botones conservan contraste al pasar el puntero`, () => {
    const colors = theme('web').palettes[mode];
    assert.ok(contrast(colors.onAccent, colors.accent) >= 4.5);
    assert.ok(contrast(colors.onAccent, colors.accentHover) >= 4.5);
    assert.ok(contrast('#ffffff', colors.dangerFill) >= 4.5);
  });
}
for (const platform of ['web', 'ios', 'android']) {
  test(`${platform}: usa tipografía del sistema sin descargas externas`, () => {
    const { fonts } = theme(platform);
    assert.ok(fonts.regular);
    assert.equal(fonts.regular, fonts.bold);
    assert.equal(fonts.regular.includes('Courier'), false);
  });
}
test('espaciado móvil y objetivos táctiles de al menos 44 puntos', () => {
  const { metrics, pagePadding, cardPadding } = theme('web');
  assert.ok(metrics.controlHeight >= 44);
  assert.ok(metrics.themeSize >= 44);
  for (const width of [320, 390, 768, 1280]) {
    assert.ok(width - 2 * pagePadding(width) - 2 * cardPadding(width) >= 200);
  }
});

test('el contador presenta minutos y segundos válidos', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../src/utils/duration.ts'),
    'utf8',
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports });
  for (const [seconds, expected] of [
    [60, '01:00'],
    [59, '00:59'],
    [1, '00:01'],
    [0, '00:00'],
    [-1, '00:00'],
  ]) {
    assert.equal(exports.formatRemainingTime(seconds), expected);
  }
});
