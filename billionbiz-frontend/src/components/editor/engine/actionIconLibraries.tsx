import React from 'react';
import {
  // Wishlist 10
  Heart,
  Bookmark,
  Star,
  Sparkles,
  Flame,
  Smile,
  Pin,
  Award,
  ThumbsUp,
  Tag,
  // Cart 10
  ShoppingCart,
  ShoppingBag,
  Package,
  Store,
  Archive,
  Truck,
  Gift,
  Briefcase,
  CreditCard,
  Layers,
  // Account 10
  User,
  UserCheck,
  ShieldCheck,
  Crown,
  KeyRound,
  CircleUserRound,
  BadgeCheck,
  Fingerprint,
  Compass,
  ContactRound,
  // Search 10
  Search,
  Scan,
  Filter,
  SlidersHorizontal,
  Eye,
  Globe,
  Crosshair,
  Maximize2,
  // Notifications 10
  Bell,
  BellRing,
  BellDot,
  Inbox,
  Megaphone,
  MessageSquare,
  Zap,
  Radio,
  // Custom Library & usable icons
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Info,
  Share2,
  Percent,
  Calendar,
  MessageCircle,
  Headphones,
  Coffee,
  Music,
  CircleDollarSign,
} from 'lucide-react';
import type { ActionItemConfig } from './types';

export interface ActionIconVariant {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number | string; color?: string; className?: string; style?: React.CSSProperties }>;
}

export const WISHLIST_ICONS: ActionIconVariant[] = [
  { id: 'wishlist-heart', name: 'Classic Heart', icon: Heart },
  { id: 'wishlist-bookmark', name: 'Bookmark Ribbon', icon: Bookmark },
  { id: 'wishlist-star', name: 'Favorite Star', icon: Star },
  { id: 'wishlist-sparkles', name: 'Magic Sparkles', icon: Sparkles },
  { id: 'wishlist-flame', name: 'Trending Flame', icon: Flame },
  { id: 'wishlist-tag', name: 'Saved Tag', icon: Tag },
  { id: 'wishlist-pin', name: 'Pinned Item', icon: Pin },
  { id: 'wishlist-award', name: 'Award Badge', icon: Award },
  { id: 'wishlist-thumbsup', name: 'Thumbs Up', icon: ThumbsUp },
  { id: 'wishlist-smile', name: 'Happy Favorites', icon: Smile },
];

export const CART_ICONS: ActionIconVariant[] = [
  { id: 'cart-standard', name: 'Shopping Cart', icon: ShoppingCart },
  { id: 'cart-bag', name: 'Boutique Bag', icon: ShoppingBag },
  { id: 'cart-package', name: 'Delivery Box', icon: Package },
  { id: 'cart-store', name: 'Storefront', icon: Store },
  { id: 'cart-gift', name: 'Gift Box', icon: Gift },
  { id: 'cart-truck', name: 'Express Truck', icon: Truck },
  { id: 'cart-briefcase', name: 'Luxury Case', icon: Briefcase },
  { id: 'cart-creditcard', name: 'Quick Checkout', icon: CreditCard },
  { id: 'cart-archive', name: 'Archive Bin', icon: Archive },
  { id: 'cart-layers', name: 'Multi-Item Stack', icon: Layers },
];

export const ACCOUNT_ICONS: ActionIconVariant[] = [
  { id: 'account-user', name: 'Classic User', icon: User },
  { id: 'account-verified', name: 'Verified Member', icon: UserCheck },
  { id: 'account-shield', name: 'Secure Profile', icon: ShieldCheck },
  { id: 'account-crown', name: 'VIP Crown', icon: Crown },
  { id: 'account-circle', name: 'Circle Avatar', icon: CircleUserRound },
  { id: 'account-badge', name: 'Badge Check', icon: BadgeCheck },
  { id: 'account-key', name: 'Passkey Access', icon: KeyRound },
  { id: 'account-fingerprint', name: 'Biometric Pass', icon: Fingerprint },
  { id: 'account-contact', name: 'Contact Card', icon: ContactRound },
  { id: 'account-compass', name: 'Explorer', icon: Compass },
];

export const SEARCH_ICONS: ActionIconVariant[] = [
  { id: 'search-magnifier', name: 'Standard Lens', icon: Search },
  { id: 'search-scan', name: 'Scanner Reticle', icon: Scan },
  { id: 'search-filter', name: 'Filtered Query', icon: Filter },
  { id: 'search-sliders', name: 'Smart Search', icon: SlidersHorizontal },
  { id: 'search-eye', name: 'Visual Discovery', icon: Eye },
  { id: 'search-crosshair', name: 'Target Finder', icon: Crosshair },
  { id: 'search-maximize', name: 'Expanded Focus', icon: Maximize2 },
  { id: 'search-globe', name: 'Global Catalog', icon: Globe },
  { id: 'search-sparkles', name: 'AI Search', icon: Sparkles },
  { id: 'search-compass', name: 'Catalog Compass', icon: Compass },
];

export const NOTIFICATIONS_ICONS: ActionIconVariant[] = [
  { id: 'notif-bell', name: 'Classic Bell', icon: Bell },
  { id: 'notif-ring', name: 'Ringing Bell', icon: BellRing },
  { id: 'notif-dot', name: 'Active Alert', icon: BellDot },
  { id: 'notif-inbox', name: 'Direct Inbox', icon: Inbox },
  { id: 'notif-megaphone', name: 'Broadcast', icon: Megaphone },
  { id: 'notif-msg', name: 'Message Bubble', icon: MessageSquare },
  { id: 'notif-mail', name: 'Letter Dispatch', icon: Mail },
  { id: 'notif-zap', name: 'Urgent Alert', icon: Zap },
  { id: 'notif-radio', name: 'Beacon Radio', icon: Radio },
  { id: 'notif-sparkles', name: 'News Sparkles', icon: Sparkles },
];

export const CUSTOM_PRESET_ICONS: ActionIconVariant[] = [
  { id: 'custom-help', name: 'Help & FAQ', icon: HelpCircle },
  { id: 'custom-phone', name: 'Call Us', icon: Phone },
  { id: 'custom-mail', name: 'Email Support', icon: Mail },
  { id: 'custom-pin', name: 'Store Locator', icon: MapPin },
  { id: 'custom-bell', name: 'Notifications', icon: Bell },
  { id: 'custom-info', name: 'Info Guide', icon: Info },
  { id: 'custom-share', name: 'Share Store', icon: Share2 },
  { id: 'custom-percent', name: 'Discounts & Offers', icon: Percent },
  { id: 'custom-currency', name: 'Currency ($)', icon: CircleDollarSign },
  { id: 'custom-gift', name: 'Rewards & Gifts', icon: Gift },
  { id: 'custom-calendar', name: 'Book Appointment', icon: Calendar },
  { id: 'custom-chat', name: 'Live Chat', icon: MessageCircle },
  { id: 'custom-headphones', name: 'Customer Care', icon: Headphones },
  { id: 'custom-zap', name: 'Flash Deals', icon: Zap },
  { id: 'custom-truck', name: 'Track Order', icon: Truck },
  { id: 'custom-globe', name: 'Language / Region', icon: Globe },
  { id: 'custom-tag', name: 'Promotions', icon: Tag },
  { id: 'custom-coffee', name: 'Lounge / Cafe', icon: Coffee },
  { id: 'custom-music', name: 'Store Radio', icon: Music },
  { id: 'custom-sparkles', name: 'Special Feature', icon: Sparkles },
  { id: 'custom-star', name: 'Reviews / VIP', icon: Star },
];

export const getVariantsForActionType = (type: string): ActionIconVariant[] => {
  if (type === 'wishlist') return WISHLIST_ICONS;
  if (type === 'cart') return CART_ICONS;
  if (type === 'account') return ACCOUNT_ICONS;
  if (type === 'search') return SEARCH_ICONS;
  if (type === 'notifications') return NOTIFICATIONS_ICONS;
  return CUSTOM_PRESET_ICONS.slice(0, 10);
};

export const getIconComponentForType = (type: string, iconId?: string) => {
  const list = getVariantsForActionType(type);

  if (iconId) {
    const match =
      list.find((v) => v.id === iconId) ||
      WISHLIST_ICONS.find((v) => v.id === iconId) ||
      CART_ICONS.find((v) => v.id === iconId) ||
      ACCOUNT_ICONS.find((v) => v.id === iconId) ||
      SEARCH_ICONS.find((v) => v.id === iconId) ||
      NOTIFICATIONS_ICONS.find((v) => v.id === iconId) ||
      CUSTOM_PRESET_ICONS.find((v) => v.id === iconId);
    if (match) return match.icon;
  }

  if (type === 'wishlist') return Heart;
  if (type === 'cart') return ShoppingCart;
  if (type === 'account') return User;
  if (type === 'search') return Search;
  if (type === 'notifications') return Bell;
  if (type === 'store-locator') return MapPin;
  if (type === 'help') return HelpCircle;
  if (type === 'track-order') return Truck;
  if (type === 'phone') return Phone;
  if (type === 'chat') return MessageCircle;
  if (type === 'currency') return CircleDollarSign;
  if (type === 'language') return Globe;
  if (type === 'share') return Share2;
  if (type === 'offers') return Percent;

  return list[0]?.icon || Heart;
};

export const STANDARD_USABLE_ACTIONS: ActionItemConfig[] = [
  {
    id: 'search',
    type: 'search',
    label: 'Search',
    iconType: 'search-magnifier',
    isNavigation: false,
    isEnabled: true,
  },
  {
    id: 'wishlist',
    type: 'wishlist',
    label: 'Wishlist',
    iconType: 'wishlist-heart',
    path: '/wishlist',
    isNavigation: true,
    isEnabled: true,
  },
  {
    id: 'account',
    type: 'account',
    label: 'Account',
    iconType: 'account-user',
    path: '/account',
    isNavigation: true,
    isEnabled: true,
  },
  {
    id: 'cart',
    type: 'cart',
    label: 'Cart',
    iconType: 'cart-standard',
    path: '/cart',
    isNavigation: false,
    isEnabled: true,
  },
  // Extra usable prebuilt actions available in disabled container by default:
  {
    id: 'notifications',
    type: 'notifications',
    label: 'Notifications',
    iconType: 'notif-bell',
    path: '/notifications',
    isNavigation: true,
    isEnabled: false,
  },
  {
    id: 'store-locator',
    type: 'store-locator',
    label: 'Store Locator',
    iconType: 'custom-pin',
    path: '/stores',
    isNavigation: true,
    isEnabled: false,
  },
  {
    id: 'help',
    type: 'help',
    label: 'Help & FAQ',
    iconType: 'custom-help',
    path: '/help',
    isNavigation: true,
    isEnabled: false,
  },
  {
    id: 'track-order',
    type: 'track-order',
    label: 'Track Order',
    iconType: 'custom-truck',
    path: '/track-order',
    isNavigation: true,
    isEnabled: false,
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Call Us',
    iconType: 'custom-phone',
    path: 'tel:+1800123456',
    isNavigation: true,
    isEnabled: false,
  },
  {
    id: 'chat',
    type: 'chat',
    label: 'Live Chat',
    iconType: 'custom-chat',
    isNavigation: false,
    isEnabled: false,
  },
  {
    id: 'currency',
    type: 'currency',
    label: 'Currency',
    iconType: 'custom-currency',
    isNavigation: false,
    isEnabled: false,
  },
  {
    id: 'language',
    type: 'language',
    label: 'Language',
    iconType: 'custom-globe',
    isNavigation: false,
    isEnabled: false,
  },
  {
    id: 'share',
    type: 'share',
    label: 'Share Store',
    iconType: 'custom-share',
    isNavigation: false,
    isEnabled: false,
  },
  {
    id: 'offers',
    type: 'offers',
    label: 'Discounts & Deals',
    iconType: 'custom-percent',
    path: '/offers',
    isNavigation: true,
    isEnabled: false,
  },
];

export const isPrebuiltAction = (id: string): boolean => {
  return STANDARD_USABLE_ACTIONS.some((item) => item.id === id);
};

/**
 * Returns default configured action items from legacy props or standard defaults
 */
export const getDefaultActionItems = (props: Record<string, any> = {}): ActionItemConfig[] => {
  if (Array.isArray(props.items) && props.items.length > 0) {
    const existing = [...props.items];
    const existingIds = new Set(existing.map((i) => i.id));
    for (const standard of STANDARD_USABLE_ACTIONS) {
      if (!existingIds.has(standard.id)) {
        existing.push({ ...standard, isEnabled: false });
      }
    }
    return existing;
  }

  return STANDARD_USABLE_ACTIONS.map((item) => {
    if (item.id === 'search') {
      return {
        ...item,
        iconType: props.searchIconType || item.iconType,
        customIconUrl: props.searchCustomIconUrl,
        isEnabled: props.showSearch !== false,
      };
    }
    if (item.id === 'wishlist') {
      return {
        ...item,
        iconType: props.wishlistIconType || item.iconType,
        customIconUrl: props.wishlistCustomIconUrl,
        isEnabled: props.showWishlist !== false,
      };
    }
    if (item.id === 'account') {
      return {
        ...item,
        iconType: props.accountIconType || item.iconType,
        customIconUrl: props.accountCustomIconUrl,
        isEnabled: props.showAccount !== false,
      };
    }
    if (item.id === 'cart') {
      return {
        ...item,
        iconType: props.cartIconType || item.iconType,
        customIconUrl: props.cartCustomIconUrl,
        isEnabled: props.showCart !== false,
      };
    }
    return { ...item, isEnabled: false };
  });
};

/**
 * Render action icon: either custom uploaded image/svg or Lucide icon component
 */
export const renderActionIcon = (
  item: ActionItemConfig,
  size: number = 18,
  color: string = 'currentColor'
): React.ReactNode => {
  if (item.customIconUrl) {
    return (
      <img
        src={item.customIconUrl}
        alt={item.label}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    );
  }

  const IconComp = getIconComponentForType(item.type, item.iconType);
  return <IconComp size={size} color={color} style={{ display: 'block' }} />;
};
