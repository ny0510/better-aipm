import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from 'react-native';

import {Colors} from '@/styles/theme/colors';
import useColors from '@/styles/theme/useColors';
import {MaterialIcons} from '@expo/vector-icons';

interface CardProps {
  title?: string;
  titleStyle?: object;
  children: React.ReactNode;
  style?: ViewStyle;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function Card({title, titleStyle, children, style, collapsible = false, defaultExpanded = true}: CardProps) {
  const colors = useColors();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggleExpanded = () => setExpanded(prev => !prev);

  return (
    <View style={[s.container, {...style}]}>
      {title && collapsible ? (
        <TouchableOpacity style={[s.collapsibleHeader, expanded && {marginBottom: 16}]} onPress={handleToggleExpanded} activeOpacity={0.7}>
          <Text style={[s.title, {marginBottom: 0}, titleStyle]}>{title}</Text>
          <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : (
        title && <Text style={[s.title, {...titleStyle}]}>{title}</Text>
      )}
      {(!collapsible || expanded) && children}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 18,
      paddingVertical: 20,
      borderRadius: 26,
      flex: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
    },
    title: {
      fontSize: 18,
      fontFamily: 'SuitBold',
      color: colors.text,
      marginBottom: 16,
    },
    collapsibleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });
