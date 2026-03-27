import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView } from 'react-native';

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: string) => void;
    title?: string;
}

const C = AuthTheme.colors;

export const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, onClose, onSelect, title = 'Select Date' }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (offset: number) => {
        let newMonth = currentMonth + offset;
        let newYear = currentYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleSelect = (day: number) => {
        // Format as YYYY-MM-DD
        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onSelect(formattedDate);
        onClose();
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Padding blocks for days from previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayBox} />);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = today.getDate() === d && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
            days.push(
                <TouchableOpacity 
                    key={d} 
                    style={[styles.dayBox, isToday && styles.todayBox]} 
                    onPress={() => handleSelect(d)}
                >
                    <Text style={[styles.dayText, isToday && styles.todayText]}>{d}</Text>
                </TouchableOpacity>
            );
        }

        return days;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color={C.darkNavy} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.monthNav}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                            <Ionicons name="chevron-back" size={20} color={C.primary} />
                        </TouchableOpacity>
                        <Text style={styles.monthLabel}>{months[currentMonth]} {currentYear}</Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                            <Ionicons name="chevron-forward" size={20} color={C.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.calendarGrid}>
                        <View style={styles.weekLabels}>
                            {daysOfWeek.map((day, idx) => (
                                <Text key={idx} style={styles.weekDayLabel}>{day}</Text>
                            ))}
                        </View>
                        <View style={styles.daysContainer}>
                            {renderDays()}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: Platform.OS === 'web' ? 350 : '100%',
        backgroundColor: C.white,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            web: { boxShadow: '0 10px 40px rgba(0,0,0,0.15)' },
            default: { elevation: 12 },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: C.darkNavy,
        letterSpacing: 0.5,
    },
    closeBtn: { padding: 4 },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    navBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF5EF', justifyContent: 'center', alignItems: 'center' },
    monthLabel: { fontSize: 16, fontWeight: '700', color: C.darkNavy },
    calendarGrid: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    weekLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    weekDayLabel: {
        width: 38,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '700',
        color: C.textGrey,
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayBox: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
        marginHorizontal: 1,
        borderRadius: 19,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
        color: C.darkNavy,
    },
    todayBox: {
        backgroundColor: C.primary,
    },
    todayText: {
        color: C.white,
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        alignItems: 'center',
    },
    cancelLink: { padding: 8 },
    cancelText: { color: C.textGrey, fontWeight: '600', fontSize: 14 },
});
