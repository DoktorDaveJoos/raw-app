import { View, Text, Pressable, ScrollView } from 'react-native';
import { colors } from '@/lib/theme';

type Category = 'push' | 'pull' | 'arms' | 'legs' | 'core';

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  arms: 'Arms',
  push: 'Shldrs',
  pull: 'Back',
  core: 'Core',
  legs: 'Legs',
};

const CATEGORIES: Category[] = ['arms', 'push', 'pull', 'core', 'legs'];

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {CATEGORIES.map((category) => {
        const isActive = category === activeCategory;
        return (
          <Pressable
            key={category}
            onPress={() => onCategoryChange(category)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: isActive ? colors.primary : colors.card,
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 14,
                color: isActive ? colors.background : colors.textMuted,
              }}
            >
              {CATEGORY_LABELS[category]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
