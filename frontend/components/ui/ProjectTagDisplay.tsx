import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tag } from '@/types/tag';

interface ProjectTagDisplayProps {
  tags: Tag[];
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function ProjectTagDisplay({ tags, maxDisplay = Infinity, size = 'medium' }: ProjectTagDisplayProps) {
  if (!tags || tags.length === 0) return null;
  
  const tagsToDisplay = maxDisplay < tags.length ? tags.slice(0, maxDisplay) : tags;
  const hasMore = maxDisplay < tags.length;
  
  const getFontSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'large': return 14;
      default: return 12;
    }
  };
  
  const getIconSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'large': return 16;
      default: return 14;
    }
  };
  
  const getPadding = () => {
    switch (size) {
      case 'small': return { vertical: 2, horizontal: 6 };
      case 'large': return { vertical: 6, horizontal: 12 };
      default: return { vertical: 4, horizontal: 8 };
    }
  };
  
  const padding = getPadding();
  
  return (
    <View style={styles.container}>
      {tagsToDisplay.map((tag) => (
        <View 
          key={tag.id} 
          style={[
            styles.tagChip, 
            { 
              backgroundColor: tag.color + '20', 
              borderColor: tag.color,
              paddingVertical: padding.vertical,
              paddingHorizontal: padding.horizontal
            }
          ]}
        >
          {tag.icon && (
            <Ionicons 
              name={`${tag.icon}-outline`} 
              size={getIconSize()} 
              color={tag.color} 
              style={styles.tagIcon}
            />
          )}
          <Text style={[styles.tagText, { color: tag.color, fontSize: getFontSize() }]}>
            {tag.name}
          </Text>
        </View>
      ))}
      
      {hasMore && (
        <View style={styles.moreTagsContainer}>
          <Text style={[styles.moreTagsText, { fontSize: getFontSize() }]}>
            +{tags.length - maxDisplay}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontWeight: '500',
  },
  tagIcon: {
    marginRight: 4,
  },
  moreTagsContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  moreTagsText: {
    color: '#666',
  }
});
