import {
  CloudRain, Cloud, CircleDashed, Sun, Sparkles,
  BatteryLow, BatteryMedium, Battery, BatteryFull, Zap,
  Leaf, Waves, Wind, CloudLightning, Tornado,
  MoonStar, Moon, CloudMoon, Stars, Sunrise,
  Clock, Check, Minus, X, Smartphone, MonitorSmartphone,
  GraduationCap, Briefcase, Users, Wallet, HeartHandshake, Compass, MoreHorizontal,
  Feather, CloudFog,
  Droplet, Droplets, GlassWater,
  Utensils, Sandwich, Soup,
  Armchair, Footprints, PersonStanding, Bike, Dumbbell,
  Home, DoorOpen, TreePine, Trees, Mountain,
  MessageCircle, User, UserMinus, Smile, Meh, Frown,
  ShieldCheck, Shield, ShieldAlert,
  Bell, Settings, Home as HomeIcon, LayoutDashboard, ListChecks, TrendingUp, Lightbulb,
  Share2, Download, Copy, Heart, Scale, Award, Trophy, Calendar, ChevronRight,
  ChevronLeft, ChevronDown, RefreshCw, Pencil, Trash2, Lock, Info, AlertTriangle,
  ArrowRight, ArrowLeft, Plus, XCircle, CheckCircle, Pause, Play, WifiOff,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  CloudRain, Cloud, CircleDashed, Sun, Sparkles,
  BatteryLow, BatteryMedium, Battery, BatteryFull, Zap,
  Leaf, Waves, Wind, CloudLightning, Tornado,
  MoonStar, Moon, CloudMoon, Stars, Sunrise,
  Clock, Check, Minus, X, Smartphone, MonitorSmartphone,
  // 'MoonOff' is not exported by this lucide version; reuse MoonStar.
  MoonOff: MoonStar,
  GraduationCap, Briefcase, Users, Wallet, HeartHandshake, Compass, MoreHorizontal,
  Feather, CloudFog,
  Droplet, Droplets, GlassWater,
  Utensils, Sandwich, Soup,
  Armchair, Footprints, PersonStanding, Bike, Dumbbell,
  Home, DoorOpen, TreePine, Trees, Mountain,
  MessageCircle, User, UserMinus, Smile, Meh, Frown,
  ShieldCheck, Shield, ShieldAlert,
  Bell, Settings, LayoutDashboard, ListChecks, TrendingUp, Lightbulb,
  Share2, Download, Copy, Heart, Scale, Award, Trophy, Calendar,
  ChevronRight, ChevronLeft, ChevronDown, RefreshCw, Pencil, Trash2, Lock, Info,
  AlertTriangle, ArrowRight, ArrowLeft, Plus, XCircle, CheckCircle, Pause, Play, WifiOff,
  HomeIcon,
};

export function getIcon(name: string): LucideIcon {
  return MAP[name] ?? CircleDashed;
}

export type { LucideIcon };
