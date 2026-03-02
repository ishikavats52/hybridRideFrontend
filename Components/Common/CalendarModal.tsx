
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    selectedDate: string;
}

const CalendarModal = ({ visible, onClose, onSelectDate, selectedDate }: CalendarModalProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const changeMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const handleDateSelect = (day: number) => {
        const month = months[currentDate.getMonth()];
        const year = currentDate.getFullYear();
        // Format: DD-Mon-YYYY (e.g., 04-Feb-2026)
        const formattedDate = `${day.toString().padStart(2, '0')}-${month.substring(0, 3)}-${year}`;
        onSelectDate(formattedDate);
        onClose();
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        const currentMonthShort = months[month].substring(0, 3);
        const selectedParts = selectedDate.split('-');
        const isSelectedMonth = selectedParts[1] === currentMonthShort && parseInt(selectedParts[2]) === year;
        const selectedDayNum = isSelectedMonth ? parseInt(selectedParts[0]) : -1;

        for (let i = 1; i <= daysInMonth; i++) {
            const isSelected = i === selectedDayNum;
            days.push(
                <TouchableOpacity
                    key={i}
                    style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                    onPress={() => handleDateSelect(i)}
                >
                    <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{i}</Text>
                </TouchableOpacity>
            );
        }

        return days;
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.calendarHeader}>
                        <Text style={styles.monthYearText}>
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Text>
                        <View style={styles.calendarNav}>
                            <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.navArrow}>
                                <FontAwesomeIcon icon={faChevronLeft} size={14} color="#374151" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => changeMonth('next')} style={styles.navArrow}>
                                <FontAwesomeIcon icon={faChevronRight} size={14} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Week Days */}
                    <View style={styles.weekRow}>
                        {weekDays.map(day => (
                            <Text key={day} style={styles.weekDayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Days Grid */}
                    <View style={styles.daysGrid}>
                        {renderCalendarDays()}
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.footerActionText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            // Reset to today logic could go here
                            const today = new Date();
                            setCurrentDate(today);
                        }}>
                            <Text style={[styles.footerActionText, { color: '#2DD4BF' }]}>Today</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
    },
    calendarNav: {
        flexDirection: 'row',
    },
    navArrow: {
        padding: 8,
        marginLeft: 8,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    weekDayText: {
        width: 32,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayCell: {
        width: '14.28%', // 100% / 7 days
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    dayText: {
        fontSize: 14,
        color: '#374151',
    },
    selectedDayCell: {
        backgroundColor: '#2DD4BF', // Teal
        borderRadius: 20,
    },
    selectedDayText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default CalendarModal;
