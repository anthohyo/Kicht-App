import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface Segment {
  bold: boolean;
  text: string;
}

function parseMarkdown(input: string): Segment[] {
  const parts = input.split('**');
  return parts.map((part, index) => ({
    bold: index % 2 === 1,
    text: part,
  }));
}

interface Props {
  text: string;
  isUser: boolean;
}

export default function MarkdownText({ text, isUser }: Props) {
  const segments = parseMarkdown(text);
  const baseColor = isUser ? colors.white : colors.text;

  return (
    <Text style={[styles.base, { color: baseColor }]}>
      {segments.map((seg, i) =>
        seg.bold ? (
          <Text key={i} style={styles.bold}>
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
});
