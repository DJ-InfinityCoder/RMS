import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide: () => void;
}

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ToastRef {
  show: (options: ToastOptions) => void;
}

const COLORS = {
  success: { bg: '#FFF', border: '#FF7A00', text: '#181C2E', icon: 'checkmark-circle' },
  error: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', icon: 'alert-circle' },
  info: { bg: '#F8F9FB', border: '#181C2E', text: '#181C2E', icon: 'information-circle' },
};

// Global ref instance
let globalToastRef: ToastRef | null = null;

export const setGlobalToastRef = (ref: ToastRef | null) => {
  globalToastRef = ref;
};

export const showGlobalToast = (options: ToastOptions) => {
  if (globalToastRef) {
    globalToastRef.show(options);
  } else {
    console.warn('Global Toast not initialized. Provide GlobalToast in your root component.');
  }
};

export const GlobalToast = forwardRef<ToastRef>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ToastOptions>({ message: '', type: 'success', duration: 2000 });

  const methods = {
    show: (opts: ToastOptions) => {
      setOptions({
        message: opts.message,
        type: opts.type || 'success',
        duration: opts.duration || 2000,
      });
      setVisible(true);
    }
  };

  useImperativeHandle(ref, () => methods);

  // Assign to global variable so we can use `showGlobalToast` anywhere
  useEffect(() => {
    setGlobalToastRef(methods);
    return () => setGlobalToastRef(null);
  }, []);

  return (
    <Toast 
      visible={visible} 
      message={options.message} 
      type={options.type} 
      duration={options.duration} 
      onHide={() => setVisible(false)} 
    />
  );
});

export default function Toast({ visible, message, type = 'success', duration = 1200, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const c = COLORS[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: c.bg, borderColor: c.border, transform: [{ translateY }], opacity },
      ]}
    >
      <Ionicons name={c.icon as any} size={20} color={c.border} />
      <Text style={[styles.text, { color: c.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    zIndex: 99999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
