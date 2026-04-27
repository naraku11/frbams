import { Tabs, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalIcon, FaceIcon, HomeIcon, LogIcon, UsersIcon } from '../../components/Icons';
import { C } from '../../lib/colors';

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { key: 'index',    label: 'Home',     Icon: HomeIcon },
    { key: 'calendar', label: 'Calendar', Icon: CalIcon },
    { key: 'checkin',  label: '',         Icon: FaceIcon, isFAB: true },
    { key: 'schedule', label: 'Schedule', Icon: LogIcon },
    { key: 'profile',  label: 'Profile',  Icon: UsersIcon },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      {tabs.map((tab, i) => {
        // FAB has no route entry; tabs after FAB map to routes[i-1]
        const fabOffset = tabs.slice(0, i).filter((t) => t.isFAB).length;
        const routeIdx  = i - fabOffset;
        const route     = state.routes[routeIdx];
        const focused   = route ? state.index === routeIdx : false;

        if (tab.isFAB) {
          return (
            <TouchableOpacity
              key="fab"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/check-in/location');
              }}
              style={styles.fab}
              activeOpacity={0.85}
            >
              <FaceIcon size={22} color={C.accentInk} strokeWidth={1.8} />
            </TouchableOpacity>
          );
        }

        const onPress = () => {
          if (!route) return;
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity key={tab.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
            <tab.Icon size={22} color={focused ? C.fg : C.fg4} strokeWidth={focused ? 2 : 1.6} />
            {tab.label ? (
              <Text style={[styles.tabLabel, { color: focused ? C.fg : C.fg4 }]}>{tab.label}</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.bg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: C.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
});
