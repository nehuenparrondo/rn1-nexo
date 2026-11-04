/**
 * Guía de lectura. Componente reutilizable avatar. Sus props conectan contenido y acciones
 * con el componente que lo usa; para seguir el dato, buscar sus importaciones y los
 * callbacks recibidos en lugar de suponer que guarda directamente en una base.
 */

import { useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/providers/theme-provider';
import { fonts, metrics } from '@/theme';

/** La inicial reemplaza una foto ausente o una imagen que no puede cargarse. */
export function Avatar({
  picture,
  name,
}: {
  picture: string | null | undefined;
  name: string;
}) {
  const { colors } = useTheme();
  const [failedPicture, setFailedPicture] = useState<string | null>(null);
  const style = {
    width: metrics.avatarSize,
    height: metrics.avatarSize,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  };
  return picture && failedPicture !== picture ? (
    <Image
      source={{ uri: picture }}
      onError={() => setFailedPicture(picture)}
      accessibilityLabel={`Foto de ${name}`}
      style={style}
      contentFit="cover"
    />
  ) : (
    <View
      style={{
        ...style,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: colors.accent,
          fontFamily: fonts.bold,
          fontSize: 26,
          fontWeight: '700',
        }}
      >
        {name.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
