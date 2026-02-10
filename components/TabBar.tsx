import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Play, ClipboardList, User } from 'lucide-react-native';
import { colors } from '@/lib/theme';

const ICON_MAP: Record<string, typeof Play> = {
  index: Play,
  log: ClipboardList,
  profile: User,
};

const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = '#4A4A4A';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter(
    (route) => route.name in ICON_MAP,
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 72 + insets.bottom,
        paddingBottom: insets.bottom,
        paddingHorizontal: 40,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.card,
      }}
    >
      {visibleRoutes.map((route) => {
        const isFocused = state.index === state.routes.indexOf(route);
        const Icon = ICON_MAP[route.name];

        if (!Icon) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[route.key].options.title}
            onPressIn={() => {
              if (process.env.EXPO_OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              alignItems: 'center',
              height: 72,
            }}
          >
            <View
              style={{
                width: 24,
                height: 2,
                borderRadius: 1,
                backgroundColor: isFocused ? ACTIVE_COLOR : 'transparent',
              }}
            />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Icon
                size={24}
                color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
