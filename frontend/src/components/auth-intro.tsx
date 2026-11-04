/**
 * Guía de lectura. Componente reutilizable auth-intro. Sus props conectan contenido y
 * acciones con el componente que lo usa; para seguir el dato, buscar sus importaciones y
 * los callbacks recibidos en lugar de suponer que guarda directamente en una base.
 */

import { StyleSheet, View } from 'react-native';
import { Copy } from './ui/typography';
import { Icon } from './icon';

/** Panel editorial para escritorio; no consulta ni modifica la sesión. */
export function AuthIntro() {
  return (
    <View style={styles.panel}>
      <View style={styles.tag}>
        <View style={styles.dot} />
        <Copy style={styles.tagText}>TU PUNTO DE ENCUENTRO</Copy>
      </View>
      <View style={{ gap: 18 }}>
        <Copy heading style={styles.title}>
          Todo empieza{'\n'}con una{'\n'}conexión.
        </Copy>
        <Copy style={styles.description}>
          Un espacio para tu perfil, tus preferencias y lo que viene después.
        </Copy>
      </View>
      <View
        style={styles.art}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View
          style={[styles.ring, { width: 230, height: 230, borderRadius: 115 }]}
        />
        <View
          style={[styles.ring, { width: 170, height: 170, borderRadius: 85 }]}
        />
        <View style={styles.center}>
          <Icon name="arrow" size={32} color="#102b26" />
        </View>
        <View style={[styles.satellite, { top: 24, right: 58 }]} />
        <View
          style={[
            styles.satellite,
            {
              bottom: 18,
              left: 48,
              width: 14,
              height: 14,
              backgroundColor: '#80dec2',
            },
          ]}
        />
        <View style={styles.orbitLabel}>
          <Icon name="check" size={16} color="#80dec2" />
          <Copy style={{ color: '#deeee9', fontSize: 12 }}>
            Tu espacio, a tu manera
          </Copy>
        </View>
      </View>
      <View style={styles.footer}>
        <Copy style={styles.footerText}>01 / CONECTÁ CON TU ESPACIO</Copy>
        <Copy style={styles.footerText}>NEXO · RN1</Copy>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  panel: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#102b2b',
    borderRadius: 28,
    padding: 36,
    gap: 30,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#80dec2' },
  tagText: {
    color: '#a5cfbf',
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  title: {
    color: '#f2f8f5',
    fontSize: 49,
    lineHeight: 55,
    letterSpacing: -2,
    fontWeight: '600',
  },
  description: {
    color: '#acc4c4',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 300,
  },
  art: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#345352',
    transform: [{ rotate: '-24deg' }, { scaleY: 0.83 }],
  },
  center: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: '#80dec2',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  satellite: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: '#f0cb9b',
  },
  orbitLabel: {
    position: 'absolute',
    bottom: 12,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#365651',
    backgroundColor: '#173b36',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#345352',
    paddingTop: 20,
  },
  footerText: { color: '#9db9b9', fontSize: 9, letterSpacing: 1.2 },
});
