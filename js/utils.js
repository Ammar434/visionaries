export function getMonthName(month) {
    return new Date(2022, month - 1).toLocaleDateString('en-US', { month: 'short' });
}

export function getMonthNumber(monthName) {
    return new Date(`${monthName} 1, 2022`).getMonth();
}

export function getSeverityLabel(severity) {
    const labels = {
        1: 'Light injury',
        2: 'Severe injury',
        3: 'Fatal'
    };
    return labels[severity] || `Severity ${severity}`;
}