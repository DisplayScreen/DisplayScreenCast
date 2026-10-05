export type SceneType =
  | 'welcome'
  | 'rules'
  | 'timer'
  | 'announcement'
  | 'break'
  | 'results'
  | 'thank_you'
  | 'custom';

export type ElementType =
  | 'text'
  | 'image'
  | 'video'
  | 'timer'
  | 'qrcode'
  | 'logo'
  | 'shape'
  | 'divider'
  | 'leaderboard'
  | 'schedule_widget'
  | 'rule_cards';

export interface BaseElementStyle {
  left: number; // percentage (0-100) or pixel
  top: number; // percentage (0-100) or pixel
  width: number; // percentage (0-100) or pixel
  height: number; // percentage (0-100) or pixel
  zIndex: number;
  opacity?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  boxShadow?: string;
  backdropBlur?: number;
  padding?: number;
  rotation?: number;
}

export interface TextStyle extends BaseElementStyle {
  color: string;
  fontSize: number; // in rem or px scale
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  letterSpacing?: string;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: string;
}

export interface SceneElement {
  id: string;
  type: ElementType;
  name: string;
  locked?: boolean;
  visible?: boolean;
  style: BaseElementStyle & Partial<TextStyle>;
  content: {
    text?: string;
    url?: string;
    alt?: string;
    qrUrl?: string;
    qrLabel?: string;
    timerLabel?: string;
    timerFormat?: 'MM:SS' | 'HH:MM:SS' | 'SS';
    shapeType?: 'rectangle' | 'circle' | 'pill' | 'card';
    leaderboardData?: Array<{ rank: number; name: string; score: string | number; badge?: string }>;
    ruleCardsData?: Array<{ number: number; title: string; description: string; tag?: string }>;
    scheduleItemsData?: Array<{ time: string; title: string; active?: boolean }>;
    videoAutoplay?: boolean;
    videoLoop?: boolean;
    videoMuted?: boolean;
  };
}

export interface SceneBackground {
  type: 'color' | 'gradient' | 'image' | 'video';
  value: string;
  opacity?: number;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface Scene {
  id: string;
  name: string;
  type: SceneType;
  description?: string;
  background: SceneBackground;
  elements: SceneElement[];
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  createdAt: number;
  updatedAt: number;
  isTemplate?: boolean;
}

export type TimerStatus = 'stopped' | 'running' | 'paused';
export type TimerMode = 'countdown' | 'stopwatch' | 'target_time';
export type TimerStyle = 'massive' | 'circular' | 'segmented' | 'pill' | 'minimal';
export type TimerFontFamily = 'mono' | 'sans' | 'display' | 'tech';

export interface AuthoritativeTimerState {
  status: TimerStatus;
  mode: TimerMode;
  targetEndTime: number | null; // ms timestamp when countdown reaches 0
  pausedRemaining: number; // ms remaining when paused
  totalDuration: number; // ms total countdown duration
  startTime: number | null; // ms timestamp when stopwatch started
  label: string;
  subtitle?: string;
  updatedAt: number;
  // A to Z customization options
  style?: TimerStyle;
  showHours?: boolean;
  showSeconds?: boolean;
  showMilliseconds?: boolean;
  showProgressBar?: boolean;
  soundOnFinish?: boolean;
  finishMessage?: string;
  warningThresholdSeconds?: number;
  criticalThresholdSeconds?: number;
  allowNegativeOvertime?: boolean;
  blinkSeparator?: boolean;
  fontFamily?: TimerFontFamily;
}

export interface EmergencyBroadcastState {
  active: boolean;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  audioAlert?: boolean;
  timestamp: number;
  previousSceneId?: string;
}

export interface BannerAnnouncement {
  id: string;
  text: string;
  title?: string;
  type: 'info' | 'warning' | 'urgent';
  active: boolean;
  expiresAt?: number;
  durationSeconds?: number;
  mode?: 'ping' | 'pinned';
}

export interface BrandKit {
  eventName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  sponsorLogos?: string[];
  customCss?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'queued' | 'active' | 'archived';
  order: number;
  createdAt: number;
}

export interface ScheduleItem {
  id: string;
  sceneId: string;
  sceneName: string;
  scheduledTime: string; // "HH:MM" 24h format
  title: string;
  enabled: boolean;
  autoTrigger: boolean;
}

export interface AssetItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'logo' | 'background';
  url: string;
  storagePath?: string;
  size: number;
  uploadedAt: number;
}

export interface DisplayPresence {
  sessionId: string;
  lastSeen: number;
  resolution: string;
  userAgent?: string;
  currentSceneId?: string;
  online: boolean;
}

export interface EventState {
  id: string;
  activeSceneId: string;
  overrideMode: 'none' | 'emergency' | 'blackout';
  emergency: EmergencyBroadcastState;
  timer: AuthoritativeTimerState;
  bannerAnnouncement: BannerAnnouncement | null;
  brandKit: BrandKit;
  version: number;
  updatedAt: number;
}

export interface FirebaseConnectionConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isCustomConfig?: boolean;
}
