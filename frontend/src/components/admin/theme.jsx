import React from 'react';
import { 
    Home, 
    Calendar, 
    Bell, 
    Plus, 
    History, 
    SlidersHorizontal, 
    Clock, 
    Check, 
    X, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    Video, 
    User, 
    MoreHorizontal, 
    AlertCircle, 
    MapPin,
    RefreshCw,
    Eye,
    EyeOff,
    Lock
} from 'lucide-react';

export const T = {
    navy: "#07192e",
    navyLight: "#0a2540",
    teal: "#0f8c7a",
    tealLight: "#1bbfa8",
    hero: "#c6f4ee",
    mint: "#d6f3ee",
    mintFaint: "#edfaf7",
    white: "#ffffff",
    glow: "rgba(27,191,168,0.18)",
};

export const I = ({ n, s = 20 }) => {
    const icons = {
        home: Home,
        calendar: Calendar,
        bell: Bell,
        plus: Plus,
        history: History,
        sliders: SlidersHorizontal,
        delay: Clock,
        check: Check,
        x: X,
        search: Search,
        chevL: ChevronLeft,
        chevR: ChevronRight,
        video: Video,
        user: User,
        more: MoreHorizontal,
        pending: AlertCircle,
        pin: MapPin,
        refresh: RefreshCw,
        eye: Eye,
        eyeOff: EyeOff,
        lock: Lock,
    };

    const IconComponent = icons[n];
    return IconComponent ? <IconComponent size={s} strokeWidth={2.5} /> : null;
};
