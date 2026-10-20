import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/providers/theme-provider';
import { fonts } from '@/theme';

/** Identidad reutilizada en acceso, perfil y administración. */
export function Brand() {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityLabel="Nexo, espacio de cuentas">
      <View
        style={[styles.mark, { backgroundColor: colors.accent }]}
        accessible={false}
      >
        <View style={styles.stroke} />
        <View style={[styles.stroke, { transform: [{ rotate: '38deg' }] }]} />
      </View>
      <View style={{ gap: 2 }}>
        <Text style={[styles.name, { color: colors.text }]}>
          nexo<Text style={{ color: colors.accent }}>.</Text>
        </Text>
        <Text style={[styles.label, { color: colors.secondary }]}>
          ESPACIO DE CUENTAS
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  stroke: { width: 5, height: 21, borderRadius: 3, backgroundColor: '#102b26' },
  name: {
    fontFamily: fonts.bold,
    fontWeight: '800',
    fontSize: 26,
    lineHeight: 29,
    letterSpacing: -1,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
