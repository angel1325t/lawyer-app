import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DS } from '../constants/designSystem';

const BottomNavigationBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  type IconName =
    | 'home-outline'
    | 'home'
    | 'document-text-outline'
    | 'document-text'
    | 'briefcase-outline'
    | 'briefcase'
    | 'person-outline'
    | 'person';

  type Tab = {
    name: string;
    iconOutline: IconName;
    iconFilled: IconName;
    route:
      | '/lawyer/home'
      | '/lawyer/cases'
      | '/lawyer/offers'
      | '/lawyer/profile';
  };

  const tabs: Tab[] = [
    { name: 'Inicio', iconOutline: 'home-outline', iconFilled: 'home', route: '/lawyer/home' },
    { name: 'Casos', iconOutline: 'document-text-outline', iconFilled: 'document-text', route: '/lawyer/cases' },
    { name: 'Ofertas', iconOutline: 'briefcase-outline', iconFilled: 'briefcase', route: '/lawyer/offers' },
    { name: 'Perfil', iconOutline: 'person-outline', iconFilled: 'person', route: '/lawyer/profile' },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => {
              if (!isActive) {
                router.push(tab.route);
              }
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
            <Ionicons
              name={isActive ? tab.iconFilled : tab.iconOutline}
              size={20}
              color={isActive ? DS.colors.primary : '#8e96b0'}
            />
            </View>
            <Text
              style={[styles.label, isActive && styles.labelActive]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigationBar;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: DS.colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: DS.colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: DS.colors.primarySoft,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8e96b0',
  },
  labelActive: {
    fontWeight: '700',
    color: DS.colors.primary,
  },
});
